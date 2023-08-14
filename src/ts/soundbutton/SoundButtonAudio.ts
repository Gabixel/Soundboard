class SoundButtonAudio<TAudioPlayer extends IAudioPlayer = IAudioPlayer> {
	_audioPlayer: TAudioPlayer;

	constructor(audioPlayer: TAudioPlayer) {
		this._audioPlayer = audioPlayer;
	}

	protected playAudio(options: AudioSourceOptions, useSecondaryStorage: boolean): void {
		this._audioPlayer.play(options, useSecondaryStorage);
	}
}