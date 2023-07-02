/**
 * Contains two {@link AudioSource} instances, one for **primary and**, the other, **for secondary output**.
 */
class AudioCouple extends EventTarget implements IAudioController {
	private _source: {
		main: AudioSource;
		playback: AudioSource;
	};

	public get src(): string {
		return this._source.main.src;
	}

	public get audioTimings(): AudioTimings {
		return this._source.main.audioTimings;
	}

	public get volume(): number {
		return this._source.main.volume;
	}
	public set volume(v: number) {
		this._source.main.volume = this._source.playback.volume = v;
	}

	constructor(
		mainOutput: AudioOutput,
		playbackOutput: AudioOutput,
		options?: { src?: string; audioTimings?: AudioTimings },
		autoPlay?: boolean
	) {
		super();

		// Audio sources
		this._source = {
			main: new AudioSource(mainOutput, options, autoPlay),
			playback: new AudioSource(playbackOutput, options, autoPlay),
		};

		this.initEventListeners();
	}

	public async play(): Promise<void> {
		let mainPlay = this._source.main.play();
		let playbackPlay = this._source.playback.play();

		await Promise.all([mainPlay, playbackPlay]);
	}

	public pause(): this {
		this._source.main.pause();
		this._source.playback.pause();

		return this;
	}

	public seekTo(time: number): void {
		this._source.main.seekTo(time);
		this._source.playback.seekTo(time);
	}

	public restart(): void {
		this._source.main.restart();
		this._source.playback.restart();
	}

	public end(): void {
		this._source.main.end();
		this._source.playback.end();
	}

	public get playing(): boolean {
		return this._source.main.playing;
	}

	public get paused(): boolean {
		return this._source.main.paused;
	}

	public get ended(): boolean {
		return this._source.main.ended;
	}

	private initEventListeners(): void {
		this.setEventsTo(this._source.main);
		this.setEventsTo(this._source.playback);
	}

	private setEventsTo(source: AudioSource) {
		$(source)
			.on("error", () => event("error"))
			.on("ended", () => event("ended"))
			.on("pause", () => event("pause"))
			.on("resume", () => event("resume"))
			.on("canplay", () => event("canplay"));

		var event = (eventName: string): void => {
			this.dispatchEvent(new Event(eventName));
		};
	}
}
