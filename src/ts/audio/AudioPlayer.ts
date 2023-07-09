/**
 * Audio management class
 */
class AudioPlayer extends Logger implements IAudioPlayer {
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

	private _storage: {
		/**
		 * First storage is limited to 1 audio.
		 */
		first: AudioStore;
		/**
		 * Second storage is unlimited.
		 */
		second: AudioStore;
	};

	// Controls
	private _$playToggleButton: JQuery<HTMLButtonElement>;
	private _$stopButton: JQuery<HTMLButtonElement>;
	private _volumeSlider: VolumeSlider;

	/**
	 * Used when we're trying to play/resume the audio, to prevent any pause/end during that time (see https://goo.gl/LdLk22).
	 * Seems pretty rare, but it's nice to have.
	 */
	private _isResuming: boolean = false;

	constructor(outputOptions?: { mainSinkId?: string; playbackSinkId?: string }) {
		super();

		this._output = {
			main: new AudioOutput(outputOptions?.mainSinkId),
			playback: new AudioOutput(outputOptions?.playbackSinkId),
		};

		this._storage = {
			first: new AudioStore(1, this._output, {
				replaceIfMaxedOut: true,
				recycleIfSingle: true,
			}),
			second: new AudioStore(-1, this._output),
		};
	}

	public play(options: AudioSourceOptions, useSecondaryStorage: boolean): void {
		if (options.src == null) {
			// TODO: log
			return;
		}

		let chosenStorage: AudioStore = useSecondaryStorage
			? this._storage.second
			: this._storage.first;

		console.log(
			"Using " + (useSecondaryStorage ? "secondary" : "primary") + " storage"
		);

		chosenStorage.storeAudio({
			src: options.src,
			audioTimings: options?.audioTimings,
			volume: this._volumeSlider.value,
		});
	}

	public setControls(
		$playToggleButton: JQuery<HTMLButtonElement>,
		$stopButton: JQuery<HTMLButtonElement>
	): this {
		this._$playToggleButton = $playToggleButton;
		$playToggleButton.on("click", () => {
			this.handlePlayPauseButtonClick();
		});

		this._$stopButton = $stopButton;
		$stopButton.on("click", () => {
			this.handleStopButtonClick();
		});

		return this;
	}

	public bindStateChange(): this {
		$(this._storage.first).on("playstatechange", () => {
			this.updatePlayPauseButton();
		});
		$(this._storage.second).on("playstatechange", () => {
			this.updatePlayPauseButton();
		});

		return this;
	}

	public setupVolumeSlider(
		$volumeSlider: JQuery<HTMLInputElement>,
		options?: {
			decimals?: number;
			exponentialBase?: number;
		}
	): this {
		this._volumeSlider = new VolumeSlider(
			$volumeSlider,
			() => {
				// Update existing audio volume
				this._storage.first.setVolume(this._volumeSlider.value);
				this._storage.second.setVolume(this._volumeSlider.value);

				// // Log new volume
				// this.logDebug(
				// 	"(single pool volume slider change)",
				// 	"Volume:",
				// 	this._mainCoupleVolumeSlider.value
				// );
				console.debug("volume changed: " + this._volumeSlider.value);
			},
			options?.decimals,
			options?.exponentialBase
		);

		// Change initial value
		$volumeSlider.trigger("input");

		// this.logInfo(
		// 	this.setupVolumeSlider,
		// 	"Sliders set!\n",
		// 	$volumeSlider,
		// );
		return this;
	}

	// TODO: move play/pause/stop functionality to a separate class
	private async handlePlayPauseButtonClick(): Promise<void> {
		if (this._storage.first.playing || this._storage.second.playing) {
			if (this._isResuming) {
				return;
			}

			this._storage.first.pause();
			this._storage.second.pause();
		} else {
			this._isResuming = true;

			try {
				await this._storage.first.play();
				await this._storage.second.play();
			} finally {
				this._isResuming = false;
			}
		}

		this.updatePlayPauseButton();
	}

	private handleStopButtonClick(): void {
		if (this._isResuming) {
			return;
		}

		this._storage.first.end();
		this._storage.second.end();
	}

	private updatePlayPauseButton(): void {
		this.setPlayPauseButton(
			this._storage.first.playing || this._storage.second.playing
		);
	}

	private setPlayPauseButton(isPlaying: boolean): void {
		// console.log("audio icon should update");

		this._$playToggleButton
			.children("i")
			.toggleClass("fa-pause", isPlaying)
			.toggleClass("fa-play", !isPlaying);
	}
}
