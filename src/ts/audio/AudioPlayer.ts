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

	constructor(outputOptions?: { mainSinkId?: string; playbackSinkId?: string }) {
		super();

		this._output = {
			main: new AudioOutput(outputOptions.mainSinkId),
			playback: new AudioOutput(outputOptions.playbackSinkId),
		};
	}
}
