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

	private _slider: VolumeSlider;

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

	public play(
		options: {
			src: string;
			audioTimings?: AudioTimings;
		},
		useSecondaryStorage: boolean
	): void {
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
			audioTimings: options.audioTimings,
		});
	}

	public setupVolumeSlider(
		$volumeSlider: JQuery<HTMLInputElement>,
		options?: {
			decimals?: number;
			exponentialBase?: number;
		}
	): this {
		this._slider = new VolumeSlider(
			$volumeSlider,
			() => {
				// Update existing audio volume
				this._storage.first.setVolume(this._slider.value);
				this._storage.second.setVolume(this._slider.value);

				// // Log new volume
				// this.logDebug(
				// 	"(single pool volume slider change)",
				// 	"Volume:",
				// 	this._mainCoupleVolumeSlider.value
				// );
				console.debug("volume changed: " + this._slider.value);
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
}
