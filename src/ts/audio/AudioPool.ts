class AudioPool extends Logger {
	private audioPool: AudioPoolGroup[] = [];

	public add(group: AudioPoolGroup): void {
		AudioPool.logInfo(this.add, "Adding group to pool:", group);

		this.audioPool.push(group);

		$(group.playback).one("ended", () => {
			group.ended = true;
			this.remove(group);
			group = null;
		});
	}

	public remove(removingGroup: AudioPoolGroup): void {
		const index = this.audioPool.indexOf(removingGroup);

		// if (!removingGroup.forcedEnding)
		AudioPool.logInfo(this.remove, "Removing pool:", removingGroup);

		this.audioPool.splice(index, 1);
	}

	public async play(): Promise<void> {
		this.audioPool.forEach(async (group) => {
			if (group.forcedStop) return;

			await group.main.play();
			await group.playback.play();
		});
	}

	public pause(): void {
		this.audioPool.forEach((group) => {
			if (group.forcedStop) return;

			group.main.pause();
			group.playback.pause();
		});
	}

	public stop(): void {
		AudioPool.logInfo(this.remove, "Forced pool stop");
		this.audioPool.forEach((group) => {
			group.forcedStop = true;

			group.main.volume = group.playback.volume = 0;

			group.main.currentTime = group.main.duration;
			group.playback.currentTime = group.playback.duration;
		});
	}

	public set volume(value: number) {
		this.audioPool.forEach((group) => {
			if (group.forcedStop) return;

			group.main.volume = group.playback.volume = value;
		});
	}

	public get isPlaying(): boolean {
		return this.audioPool.some(
			(group) => group.main.paused === false || group.playback.paused === false
		);
	}

	public get length(): number {
		return this.audioPool.length;
	}

	public get multiLength(): number {
		return this.audioPool.length * 2;
	}

	public get hasAudio(): boolean {
		return this.audioPool.length > 0;
	}
}