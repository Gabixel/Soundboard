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
	 * Can be use to re-use the same audio source (if the limit is 1), or the oldest identical from the list (2 or more).
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
		return this.some((couple) => couple.playing);
	}

	public async play(): Promise<void> {
		for await (const couple of this._audioCoupleList) {
			couple.play();
		}
	}

	public pause(): void {
		this.forEach((couple) => {
			couple.pause();
		});
	}

	public end(): void {
		this.forEach((couple) => {
			couple.end();
		});
	}

	public async storeAudio(options: {
		src?: string;
		// TODO: timings & filters
		audioTimings?: AudioTimings;
	}): Promise<void> {
		// When limit is 1 and recycle is enabled
		if (this._storageLimit == 1 && this._recycleCopies) {
			const couple = this._audioCoupleList[0];

			// TODO: update settings (i.e. timings & effects)
			if (couple.src === options.src) {
				await couple.restart();
			} else {
				this._audioCoupleList[0].changeAudio(options.src);
			}

			return;
		}

		if (!this.hasFreeStorage()) {
			// TODO: log

			if (
				!this._replaceIfMaxedOut ||
				(this._replaceIfMaxedOut && this.foundCopyAndRestarted(options))
			) {
				return;
			}

			// Replace is enabled and there's no existing similar audio

			// Get oldest couple
			let replacingCouple = this._audioCoupleList.shift();

			// Remove remove events
			$(replacingCouple).off("ended error canplay");

			// Dispose old couple
			replacingCouple.end();
			replacingCouple = null;
		}

		this.createAndPushCouple(options);
	}

	private createAndPushCouple(
		options?: AudioSourceOptions,
		index?: number
	): AudioCouple {
		let couple = new AudioCouple(
			this._output.main,
			this._output.playback,
			options,
			true,
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
					this._audioCoupleList.splice(index, 1);
				}

				// Trigger storage state change event
				this.dispatchEvent(new Event("playstatechange"));
			})
			.on("canplay", () => {
				// Trigger storage state change event
				this.dispatchEvent(new Event("playstatechange"));
			});

		return couple;
	}

	private foundCopyAndRestarted(options: AudioSourceOptions): boolean {
		let couple: AudioCouple = null;

		let coupleIndex = this._audioCoupleList.findIndex(
			(couple) =>
				// Couple has same src
				couple?.src == options?.src &&
				// Couple has same timings
				JSON.stringify(couple?.audioTimings ?? null) ==
					JSON.stringify(options?.audioTimings ?? null)
		);

		if (coupleIndex >= 0) {
			console.log("found audio copy at index " + coupleIndex);

			couple = this._audioCoupleList.splice(coupleIndex, 1)[0];
			this._audioCoupleList.push(couple);
		}

		// Restart couple
		couple?.restart();

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
