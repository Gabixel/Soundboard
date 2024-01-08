/**
 * Contains two {@link AudioSource} instances, one for **primary and**, the other, **for secondary output**.
 */
class AudioCouple extends EventTarget implements IAudioControls {
	/**
	 * The audio sources.
	 */
	private _couple: {
		main: AudioSource;
		playback: AudioSource;
	};

	public get betterSrc(): string {
		return this._couple.main.betterSrc;
	}

	public get audioTimings(): AudioTimings {
		return this._couple.main.audioTimings;
	}

	public set audioTimings(audioTimings: AudioTimings) {
		this._couple.main.audioTimings = audioTimings;
	}

	public get loop(): boolean {
		return this._couple.main.loop;
	}

	public set loop(loop: boolean) {
		this._couple.main.loop = this._couple.playback.loop = loop;
	}

	public get volume(): float {
		return this._couple.main.volume;
	}

	public set volume(volume: float) {
		this._couple.main.volume = this._couple.playback.volume = volume;
	}

	constructor(
		mainOutput: AudioOutput,
		playbackOutput: AudioOutput,
		audioSettings?: AudioSourceSettings,
		preserveOnEnd?: boolean
	) {
		super();

		this._couple = {
			main: new AudioSource(mainOutput, audioSettings, preserveOnEnd),
			playback: new AudioSource(
				playbackOutput,
				audioSettings,
				preserveOnEnd,
				false
			),
		};

		this.initEventListeners();
	}

	public changeTrack(src?: string): void {
		this._couple.main.changeTrack(src);
		this._couple.playback.changeTrack(src);
	}

	public async play(): Promise<void> {
		let mainPlay = this._couple.main.play();
		let playbackPlay = this._couple.playback.play();

		await Promise.all([mainPlay, playbackPlay]);
	}

	public pause(): this {
		this._couple.main.pause();
		this._couple.playback.pause();

		return this;
	}

	public seekTo(time: number): boolean {
		let seeked = false;

		seeked = this._couple.main.seekTo(time);
		seeked = this._couple.playback.seekTo(time) == seeked && seeked;

		return seeked;
	}

	public async restart(): Promise<void> {
		await this._couple.main.restart();
		await this._couple.playback.restart();
	}

	public async end(): Promise<void> {
		await this._couple.main.end();
		await this._couple.playback.end();
	}

	public get playing(): boolean {
		return this._couple.main.playing;
	}

	public get paused(): boolean {
		return this._couple.main.paused;
	}

	public get ended(): boolean {
		return this._couple.main.ended;
	}

	private initEventListeners(): void {
		this.setEventsTo(this._couple.main);
		// this.setEventsTo(this._source.playback);
		$(this._couple.playback).on("error", () => {});
	}

	private setEventsTo(source: AudioSource) {
		$(source)
			.on("error", () => this.dispatchEvent(new Event("error")))
			.on("ended", () => this.dispatchEvent(new Event("ended")))
			.on("pause", () => this.dispatchEvent(new Event("pause")))
			.on("resume", () => this.dispatchEvent(new Event("resume")))
			.on("canplay", () => this.dispatchEvent(new Event("canplay")))
			.on("suspend", () => this.dispatchEvent(new Event("suspend")))
			.on("loadedmetadata", () => this.dispatchEvent(new Event("loadedmetadata")));
	}
}
