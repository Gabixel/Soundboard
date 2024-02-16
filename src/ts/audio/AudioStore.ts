/**
 * Storage for one or more audio couples.
 */
class AudioStore extends EventTarget {
	private _storageLimit: number;
	private _storageName: string = "";
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
		},
		storageName: string = ""
	) {
		super();

		this._storageLimit = storageLimit;
		this._storageName = storageName;

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

			// FIXME: this logic feels wrong. it's probably better to pass stuff elsewhere
			// TODO: as per previous TODO, update more data (e.g. effects & playbackrate, in the future)
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

			// Remove events
			this.unmountCoupleEvents(replacingCouple);

			// Dispose old couple
			await replacingCouple.end();
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
			this._recycleCopies,
			// Prefix with index
			`[${this._storageName} Audio Store (index: ${
				index ?? this._audioCoupleList.length
			})]`
		);

		// TODO: better explain
		// Store new index
		if (!index) {
			index = this._audioCoupleList.push(couple) - 1;
		} else {
			this._audioCoupleList[index] = couple;
		}

		$(couple)
			.on("ended error abort", (e) => {
				if (!this._recycleCopies) {
					const message = `Audio '${e.type}' event at index ${index} (storage: '${this._storageName ?? "[no name]"}', limit: ${this._storageLimit > 0 ? this._storageLimit : "unlimited"}). Removing from list...`;
					e.type == "ended"
						? Logger.logDebug(message)
						: e.type == "error"
						? Logger.logError(message)
						: Logger.logWarn(message);

					this.unmountCoupleEvents(this._audioCoupleList[index]);

					// Remove if ended or if something went wrong (only when we don't keep the audio)
					this._audioCoupleList[index] = null;
				}

				this.dispatchEvent(new Event("playstatechange"));

				// Clear array if it's all null
				if (
					this._audioCoupleList.every((coupleIteration) => coupleIteration === null)
				) {
					Logger.logDebug("Disposing entire list since it's all null");

					this._audioCoupleList.length = 0;
				}
			})
			.on("canplay pause suspend", () => {
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

	private unmountCoupleEvents(couple: AudioCouple): void {
		$(couple).off("ended error abort canplay pause suspend");
	}
}
