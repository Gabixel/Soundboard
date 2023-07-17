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
		 * First (single) storage is limited to 1 audio.
		 */
		single: AudioStore;
		/**
		 * Second (parallel) storage is unlimited.
		 */
		parallel: AudioStore;
	};

	// Controls
	private _$playToggleButton: JQuery<HTMLButtonElement>;
	private _$stopButton: JQuery<HTMLButtonElement>;
	private _$loopButton: JQuery<HTMLInputElement>;
	private _volumeSlider: VolumeSlider;

	/**
	 * Used when we're trying to play/resume the audio, to prevent any pause/end during that time (see https://goo.gl/LdLk22).
	 * Seems pretty rare, but it's nice to have.
	 */
	private _isAwaitingAudio: boolean = false;

	constructor(outputOptions?: { mainSinkId?: string; playbackSinkId?: string }) {
		super();

		this._output = {
			main: new AudioOutput(outputOptions?.mainSinkId),
			playback: new AudioOutput(outputOptions?.playbackSinkId),
		};

		this._storage = {
			single: new AudioStore(1, this._output, {
				replaceIfMaxedOut: true,
				recycleIfSingle: true,
			}),
			parallel: new AudioStore(-1, this._output),
		};
	}

	public async play(
		options: AudioSourceOptions,
		useSecondaryStorage: boolean
	): Promise<void> {
		if (options.src == null) {
			console.log("given source is null, skipping");
			return;
		}

		let chosenStorage: AudioStore = useSecondaryStorage
			? this._storage.parallel
			: this._storage.single;

		this._isAwaitingAudio = true;
		await chosenStorage.storeAudio({
			src: options.src,
			audioTimings: options?.audioTimings,
			loop: this._$loopButton.is(":checked")
		});
		this._isAwaitingAudio = false;
	}

	public setControls(
		$playToggleButton: JQuery<HTMLButtonElement>,
		$stopButton: JQuery<HTMLButtonElement>,
		$loopButton: JQuery<HTMLInputElement>
	): this {
		this._$playToggleButton = $playToggleButton;
		this._$playToggleButton.on("click", () => {
			this.handlePlayPauseButtonClick();
		});

		this._$stopButton = $stopButton;
		this._$stopButton.on("click", (e) => {
			this.handleStopButtonClick(e);
		});

		this._$loopButton = $loopButton;
		this._$loopButton.on("change", (e) => {
			let checked = $(e.target).is(":checked");
			this._storage.single.setLoop(checked);
		});

		return this;
	}

	public bindStateChange(): this {
		$(this._storage.single).on("playstatechange", () => {
			this.updatePlayPauseButton();
		});
		$(this._storage.parallel).on("playstatechange", () => {
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
				this._output.main.setVolume(this._volumeSlider.value);
				this._output.playback.setVolume(this._volumeSlider.value);

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
		if (this._storage.single.playing || this._storage.parallel.playing) {
			if (this._isAwaitingAudio) {
				return;
			}

			this._storage.single.pause();
			this._storage.parallel.pause();
		} else {
			this._isAwaitingAudio = true;

			try {
				await this._storage.single.play();
				await this._storage.parallel.play();
			} finally {
				this._isAwaitingAudio = false;
			}
		}

		this.updatePlayPauseButton();
	}

	private handleStopButtonClick(
		e: JQuery.ClickEvent<
			HTMLButtonElement,
			undefined,
			HTMLButtonElement,
			HTMLButtonElement
		>
	): void {
		if (this._isAwaitingAudio) {
			return;
		}

		// If the user doesn't press the shift key, also stop the single storage
		if (!e.shiftKey) {
			this._storage.single.end();
		}

		this._storage.parallel.end();
	}

	private updatePlayPauseButton(): void {
		this.setPlayPauseButton(
			this._storage.single.playing || this._storage.parallel.playing
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
