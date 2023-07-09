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

	constructor(
		mainOutput: AudioOutput,
		playbackOutput: AudioOutput,
		options?: AudioSourceOptions,
		autoPlay?: boolean,
		preserveOnEnd?: boolean
	) {
		super();

		// Audio sources
		this._source = {
			main: new AudioSource(mainOutput, options, autoPlay, preserveOnEnd),
			playback: new AudioSource(playbackOutput, options, autoPlay, preserveOnEnd),
		};

		this.initEventListeners();
	}

	public changeAudio(src: string): void {
		// TODO: update timings, etc.
		this._source.main.changeAudio(src);
		this._source.playback.changeAudio(src);
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
		// this.setEventsTo(this._source.playback);
		$(this._source.playback).on("error", () => {});
	}

	private setEventsTo(source: AudioSource) {
		$(source)
			.on("error", () => this.dispatchEvent(new Event("error")))
			.on("ended", () => this.dispatchEvent(new Event("ended")))
			.on("pause", () => this.dispatchEvent(new Event("pause")))
			.on("resume", () => this.dispatchEvent(new Event("resume")))
			.on("canplay", () => this.dispatchEvent(new Event("canplay")));
	}
}
