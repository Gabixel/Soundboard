/**
 * Storage for one or more audio couples.
 */
class AudioStore extends EventTarget {
	private _storageLimit: number;
	private _audioCoupleList: AudioCouple[] = [];

	private _output: {
		/**
		 * The primary output. It should go to the (hopefully) virtual output so that it can be redirected to virtual inputs.
		 */
		main: AudioOutput;
		/**
		 * The secondary output. It should do, as the name implies, _play back_ the audio to the user to hear it playing.
		 */
		playback: AudioOutput;
	};

	private _replaceIfMaxedOut: boolean;

	/**
	 * Can be used to recycle the same audio source (if the limit is 1), or the oldest identical from the list (2 or more).
	 */
	private _recycleCopies: boolean;

	/**
	 * @param storageLimit If the limit is less than 1, there won't be one. By default is `-1` for better readability.
	 */
	constructor(
		storageLimit: number = -1,
		output: {
			main: AudioOutput;
			playback: AudioOutput;
		},
		options?: {
			/**
			 * To be used when a storage limit is set.
			 */
			replaceIfMaxedOut?: boolean;
			/**
			 *  This removes the `replaceIfMaxedOut` option if enabled.
			 */
			recycleIfSingle?: boolean;
		}
	) {
		super();

		this._storageLimit = storageLimit;

		this._recycleCopies = options?.recycleIfSingle ?? storageLimit == 1;

		this._replaceIfMaxedOut =
			!this._recycleCopies && (options?.replaceIfMaxedOut ?? false);

		this._output = output;

		// Create recycling audio couple
		if (this._recycleCopies) {
			this.createAndPushCouple();
		}
	}

	public get playing(): boolean {
		return this.some((couple) => couple?.playing ?? false);
	}

	public async play(): Promise<void> {
		for await (const couple of this._audioCoupleList) {
			couple?.play();
		}
	}

	public pause(): void {
		this.forEach((couple) => {
			couple?.pause();
		});
	}

	public end(): void {
		this.forEach((couple) => {
			couple?.end();
		});
	}

	public async storeAudio(audioSettings: AudioSourceSettings): Promise<void> {
		// TODO: improve checks and apply all data if it changes

		// When limit is 1 and recycle is enabled
		if (this._storageLimit == 1 && this._recycleCopies) {
			const couple = this._audioCoupleList[0];

			// TODO: update more data (e.g. effects & playbackrate, in the future)
			couple.volume = audioSettings.volume;
			couple.audioTimings = audioSettings.audioTimings;

			if (couple.betterSrc === audioSettings.src) {
				await couple.restart();
			} else {
				couple.changeTrack(audioSettings.src);
			}

			return;
		}

		if (!this.hasFreeStorage()) {
			// TODO: log

			// If we don't replace, we just return
			if (
				!this._replaceIfMaxedOut ||
				(await this.foundCopyAndRestarted(audioSettings))
			) {
				return;
			}

			// Get oldest couple
			let replacingCouple = this._audioCoupleList.shift();

			// Remove remove events
			$(replacingCouple).off("ended error canplay");

			// Dispose old couple
			replacingCouple.end();
			replacingCouple = null;
		}

		this.createAndPushCouple(audioSettings);
	}

	public setLoop(loop: boolean) {
		this.forEach((couple) => {
			if (couple == null) {
				return;
			}

			couple.loop = loop;
		});
	}

	private createAndPushCouple(
		audioSettings?: AudioSourceSettings,
		index?: number
	): AudioCouple {
		let couple = new AudioCouple(
			this._output.main,
			this._output.playback,
			audioSettings,
			this._recycleCopies
		);

		// Store new index
		if (!index) {
			index = this._audioCoupleList.push(couple) - 1;
		} else {
			this._audioCoupleList[index] = couple;
		}

		$(couple)
			.on("ended error", () => {
				if (!this._recycleCopies) {
					// Remove if ended or if something goes wrong (only when we don't keep the audio)
					Logger.logDebug(
						`Audio ended at index ${index} (storage limit: ${this._storageLimit})`
					);
					this._audioCoupleList[index] = null;
				}

				// Trigger storage state change event
				this.dispatchEvent(new Event("playstatechange"));

				// Clear array if it's all null
				if (
					this._audioCoupleList.every((coupleIteration) => coupleIteration === null)
				) {
					Logger.logDebug("Disposing entire list since it's all null");

					this._audioCoupleList.length = 0;
				}
			})
			.on("canplay", () => {
				// Trigger storage state change event
				this.dispatchEvent(new Event("playstatechange"));
			})
			.on("pause", () => {
				Logger.logDebug("Audio paused at index " + index);

				// Trigger storage state change event
				this.dispatchEvent(new Event("playstatechange"));
			});

		return couple;
	}

	private async foundCopyAndRestarted(
		audioSettings: AudioSourceSettings
	): Promise<boolean> {
		let couple: AudioCouple = null;

		let coupleIndex = this._audioCoupleList.findIndex(
			(couple) =>
				couple != null &&
				// Couple has same src
				couple.betterSrc == audioSettings.src &&
				// Couple has same timings
				JSON.stringify(couple.audioTimings ?? null) ==
					JSON.stringify(audioSettings.audioTimings ?? null)
		);

		if (coupleIndex > -1) {
			Logger.logDebug("Found audio copy at index " + coupleIndex);

			couple = this._audioCoupleList.splice(coupleIndex, 1)[0];
			this._audioCoupleList.push(couple);
		}

		await couple?.restart();

		return couple != undefined;
	}

	private hasFreeStorage(): boolean {
		return (
			// If the array has infinite limit
			this._storageLimit < 1 || this._audioCoupleList.length < this._storageLimit
			// ||
			// // If the playing audio count is below the limit
			// this._audioCoupleList.filter((couple) => couple.playing).length <
			// 	this._storageLimit
		);
	}

	private forEach(
		callbackfn: (value: AudioCouple, index: number, array: AudioCouple[]) => void
	) {
		this._audioCoupleList.forEach(callbackfn, this);
	}

	private some(
		predicate: (
			value: AudioCouple,
			index: number,
			array: AudioCouple[]
		) => unknown
	): boolean {
		return this._audioCoupleList.some(predicate, this);
	}
}
