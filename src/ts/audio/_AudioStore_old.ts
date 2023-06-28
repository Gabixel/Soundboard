/**
 * Creates and stores audio tracks, with the help of an {@link AudioCoupleCollection} and instructions sent by an {@link AudioPlayer}.
 */
class AudioStore extends Logger {
	// Main audio group
	private _mainCouple: AudioCouple;
	// Secondary audio group (which contains a list of audio groupd)
	private _coupleCollection: AudioCoupleCollection = new AudioCoupleCollection();
	// Hardcoded limit for the couple collection
	private _coupleCollectionLimit: number = 10;

	// private _currentDeviceId: string;
	// public get currentDeviceId(): string {
	// 	return this._currentDeviceId;
	// }

	constructor(singlePoolVolume: number = 0) {
		super();

		// Create main audio pool
		let main = new Audio();
		let playback = new Audio();
		this._mainCouple = {
			main,
			playback,
			$all: $(main).add($(playback)),
			all: (func) => {
				func(main);
				func(playback);
			},
			lastTrack: "",
		};

		// TODO: caching (somehow)?
		// Set anonymous crossorigin for caching
		// See: https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video/#:~:text=elements%20need%20to%20opt%20into%20CORS%20mode%20with%20the%20crossorigin%20attribute
		// main.crossOrigin = playback.crossOrigin = "anonymous";

		// Set to desired volume
		// TODO: sum with overriding volume when it will be implemented
		this._mainCouple.main.volume = this._mainCouple.playback.volume =
			singlePoolVolume;

		// Use "default" device id for playback
		this._mainCouple.playback.setSinkId("default");

		// Add audio events
		this._mainCouple.$all
			.on("canplay", () => {
				AudioStore.logInfo("[constructor]", "Audio can play");
				this.playGroup(this._mainCouple);
			})
			.on("error", (e) => {
				AudioStore.logError(
					"(singlePool.main 'onerror' event)",
					"Error loading audio\n",
					`(Code ${e.target.error.code}) "${e.target.error.message}"\n`,
					e
				);
			});
	}

	public async setAudioDevice(device: MediaDeviceInfo): Promise<void> {
		await this._mainCouple.main
			.setSinkId(device.deviceId)
			// .then(() => {
			// 	// Store new device id
			// 	// this._currentDeviceId = device.deviceId;

			// 	// TODO: handle in case of same deviceId/groupId/label for both main and playback
			// })
			.catch((e) => {
				AudioStore.logError(
					this.setAudioDevice,
					`Error while setting audio device '${device?.label}'`,
					"\n",
					e
				);
			});
	}

	public addToSinglePool(path: string, time: AudioTimings): void {
		// The intended use is to interrupt all audio in the multi pool when starting the single group
		this.stopMultiPoolAudio();

		// If the path is different from the previous one
		if (this._mainCouple.lastTrack !== path) {
			AudioStore.logInfo(
				this.addToSinglePool,
				"New path different from previous one.\n%s",
				`• Last track path: "%c%s%c"\n%s`,
				"color: #03fc98;",
				this._mainCouple.lastTrack,
				"",
				`• New track path: "%c%s%c"`,
				"color: #03fc98;",
				path,
				""
			);

			this._mainCouple.lastTrack = path;
			this._mainCouple.main.src = this._mainCouple.playback.src = path;
			AudioStore.logInfo(
				this.addToSinglePool,
				`Setting new path: "%c%s%c"`,
				"color: #03fc98;",
				path,
				""
			);

			this._mainCouple.main.load();
			this._mainCouple.playback.load();
		}

		const timeInSeconds = time.start / 1000;

		this._mainCouple.main.currentTime = this._mainCouple.playback.currentTime =
			timeInSeconds;
		// TODO: notify if the start time is longer than the actual duration of the track
		// TODO: end time
	}

	public addToMultiPool(audioGroup: AudioCouple): void {
		AudioStore.logInfo(
			this.addToMultiPool,
			"Adding new group to multi pool:",
			audioGroup
		);

		this._coupleCollection.add(audioGroup);

		this.playGroup(audioGroup);
	}

	public async play(): Promise<void> {
		if (
			this._mainCouple.lastTrack != "" /* &&
			this.singlePool.main.currentTime != this.singlePool.main.duration*/ // This is a nice feature
		) {
			await this._mainCouple.main.play();
			await this._mainCouple.playback.play();
		}

		if (this._coupleCollection.hasAudio) {
			await this._coupleCollection.play();
		}
	}

	public pause(): void {
		this._mainCouple.main.pause();
		this._mainCouple.playback.pause();

		if (this._coupleCollection.hasAudio) this._coupleCollection.pause();
	}

	public stop(): void {
		this._mainCouple.main.pause();
		this._mainCouple.playback.pause();

		this.stopSinglePoolAudio();
		this.stopMultiPoolAudio();
	}

	public get isPlaying(): boolean {
		return (
			this._mainCouple.main.paused === false ||
			(this._coupleCollection.hasAudio && this._coupleCollection.isPlaying)
		);
	}

	public get isLimitReached(): boolean {
		return this._coupleCollection.length > this._coupleCollectionLimit;
	}

	private playGroup(group: AudioCouple): void {
		group.main.play();
		group.playback.play();
	}

	public setSinglePoolVolume(value: number): void {
		this._mainCouple.main.volume = this._mainCouple.playback.volume = value;
	}

	public setMultiPoolVolume(value: number): void {
		if (this._coupleCollection.hasAudio) this._coupleCollection.volume = value;
	}

	private stopSinglePoolAudio(): void {
		try {
			this._mainCouple.$all.stop();
		} catch (e) {
			AudioStore.logError(this.stopSinglePoolAudio, "", e);
			return;
		}

		this._mainCouple.lastTrack = "";
	}

	private stopMultiPoolAudio(): void {
		if (!this._coupleCollection.hasAudio) {
			return;
		}

		this._coupleCollection.stop();
	}
}
