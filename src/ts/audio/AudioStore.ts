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
	 * If the limit is set to 1, choose if to re-use the same audio source.
	 */
	private _recycleIfSingle: boolean;

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
			recycleIfSingle?: boolean;
		}
	) {
		super();

		this._storageLimit = storageLimit;

		this._replaceIfMaxedOut = options?.replaceIfMaxedOut ?? false;

		this._recycleIfSingle = options?.recycleIfSingle ?? storageLimit == 1;

		this._output = output;

		if (this._recycleIfSingle) {
			this.createAndPushCouple();
		}
	}

	public pause(): void {
		this._audioCoupleList.forEach((couple) => {
			couple.pause();
		});
	}

	public storeAudio(options: {
		src: string;
		// TODO: timings & filters
		audioTimings?: AudioTimings;
	}): void {
		if (this._recycleIfSingle) {
			const couple = this._audioCoupleList[0];

			if (couple.src === options.src) {
				couple.seekTo(0);
			} else {
				this._audioCoupleList[0].changeAudio(options.src);
			}

			return;
		}

		if (!this.hasFreeStorage()) {
			// TODO: log

			if (this.foundCopyAndRestarted(options)) {
				// If an identical copy has been revived
				// TODO: log
				return;
			}

			if (!this._replaceIfMaxedOut) {
				return;
			}

			// Replace is enabled

			// Get oldest couple
			let replacingCouple = this._audioCoupleList.shift();

			// Remove remove events
			$(replacingCouple).off("ended error pause resume");

			// Add new couple to the old index
			this.createAndPushCouple(options);

			// Dispose old couple
			replacingCouple.end();
			replacingCouple = null;
		} else {
			// Free storage
			this.createAndPushCouple(options);
		}
	}

	private createAndPushCouple(
		options?: {
			src?: string;
			// TODO: timings & filters
			audioTimings?: AudioTimings;
		},
		index?: number
	): AudioCouple {
		let couple = new AudioCouple(
			this._output.main,
			this._output.playback,
			options,
			true,
			this._recycleIfSingle
		);

		// Store new index
		if (index == undefined) {
			index = this._audioCoupleList.push(couple) - 1;
		} else {
			this._audioCoupleList[index] = couple;
		}

		$(couple)
			.on("ended error", () => {
				if (!this._recycleIfSingle) {
					// Remove if ended or if something goes wrong (only when we don't keep the audio)
					this._audioCoupleList.splice(index);
				}

				// Trigger storage state change event
				this.dispatchEvent(new Event("statechange"));
			})
			.on("pause resume", () => {
				// Trigger storage state change event
				this.dispatchEvent(new Event("statechange"));
			});

		return couple;
	}

	private foundCopyAndRestarted(options: {
		src: string;
		// TODO: timings & filters
		audioTimings?: AudioTimings;
	}): boolean {
		if (this._audioCoupleList.length == 0) {
			return false;
		}

		let couple: AudioCouple = null;

		let coupleIndex = this._audioCoupleList.findIndex(
			(couple) =>
				// Couple has same src
				couple.src == options.src &&
				// Couple has same timings
				JSON.stringify(couple.audioTimings ?? null) ==
					JSON.stringify(options.audioTimings ?? null)
		);

		if (coupleIndex >= 0) {
			console.log("found at index " + coupleIndex);
			
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
}
