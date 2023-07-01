class AudioCouple extends Logger implements IAudioController {
	private _source: {
		main: AudioSource;
		playback: AudioSource;
	};

	public get volume(): number {
		return this._source.main.volume;
	}
	public set volume(v: number) {
		this._source.main.volume = this._source.playback.volume = v;
	}

	constructor(
		mainOutput: AudioOutput,
		playbackOutput: AudioOutput,
		options?: { src?: string; audioTimings?: AudioTimings }
	) {
		super();

		this._source = {
			main: new AudioSource(mainOutput, options),
			playback: new AudioSource(playbackOutput, options),
		};
	}

	public play(): Promise<void> {
		throw new Error("Method not implemented.");
	}

	public pause(): this {
		throw new Error("Method not implemented.");
	}

	public get paused(): boolean {
		return this._source.main.paused && this._source.playback.paused;
	}
}
