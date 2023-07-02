/**
 * Storage for one or more audio couples.
 */
class AudioStore extends Logger {
	private _storageLimit: number;
	private _audioCoupleList: AudioCouple[] = [];

	private _replaceIfMaxedOut: boolean;

	/**
	 * @param storageLimit If the limit is less than 1, there won't be one. By default is `-1` for better readability.
	 */
	constructor(
		storageLimit: number = -1,
		options?: {
			/**
			 * To be used when a storage limit is set.
			 */
			replaceIfMaxedOut?: boolean;
		}
	) {
		super();

		this._storageLimit = storageLimit;

		this._replaceIfMaxedOut = options?.replaceIfMaxedOut ?? false;
	}

	public storeCouple(
		output: {
			main: AudioOutput;
			playback: AudioOutput;
		},
		options: {
			src: string;
			// TODO: timings & filters
			audioTimings?: AudioTimings;
		}
	): void {
		if (this.foundCopyAndRestarted(options)) {
			// TODO: log
			return;
		}

		if (this.hasFreeStorage()) {
			createAndPushCouple();
		} else {
			// TODO: log

			if (!this._replaceIfMaxedOut) {
				return;
			}

			// Replace is enabled

			// Get oldest couple
			let replacingCouple = this._audioCoupleList[0];

			// Remove remove events
			$(replacingCouple).off("ended error");

			// Add new couple to the old index
			createAndPushCouple(0);

			replacingCouple.end();
			replacingCouple = null;
		}

		var createAndPushCouple = (index: number = null): AudioCouple => {
			let couple = new AudioCouple(output.main, output.playback, options, true);

			// Store new index
			if (index === null) {
				index = this._audioCoupleList.push(couple) - 1;
			} else {
				this._audioCoupleList[index] = couple;
			}

			$(couple).on("ended error", () => {
				this._audioCoupleList.splice(index);
			});

			return couple;
		};
	}

	private foundCopyAndRestarted(options: {
		src: string;
		// TODO: timings & filters
		audioTimings?: AudioTimings;
	}): boolean {
		let couple = this._audioCoupleList.find(
			(couple) =>
				// Couple is playing
				couple.playing &&
				// Couple has same src
				couple.src == options.src &&
				couple.audioTimings === options.audioTimings
		);

		couple?.restart();

		return couple != undefined;
	}

	private hasFreeStorage(): boolean {
		return (
			// If the array has infinite limit
			this._storageLimit < 1 ||
			// If the playing audio count is below the limit
			this._audioCoupleList.filter((couple) => couple.playing).length <
				this._storageLimit
		);
	}
}
