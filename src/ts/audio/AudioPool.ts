class AudioPool extends Logger {
	private audioPool: AudioPoolGroup[] = [];

	public add(group: AudioPoolGroup): void {
		AudioPool.logInfo(this.add, "Adding group to pool:", group);

		this.audioPool.push(group);

		$(group.main).one("ended", () => {
			// Set the track as 'ended' only if it finished by itself
			group.ended = !group.forcedStop;

			this.remove(group);

			group = null;
		});
	}

	public remove(removingGroup: AudioPoolGroup): void {
		const index = this.audioPool.indexOf(removingGroup);

		if (index == -1) {
			AudioPool.logWarn(
				this.remove,
				"Removing pool is already removed:",
				removingGroup
			);
		}

		// if (!removingGroup.forcedEnding)
		AudioPool.logInfo(this.remove, "Removing pool:", removingGroup);

		this.audioPool.splice(index, 1);
	}

	public async play(): Promise<void> {
		for (const group of this.audioPool) {
			if (group.forcedStop) return;

			await group.main.play();
			await group.playback.play();
		}
	}

	public pause(): void {
		this.audioPool.forEach((group) => {
			AudioPool.logDebug(
				this.pause,
				"Trying to pause " + this.audioPool.length + " audio group(s)\n"
			);

			if (group.forcedStop) return;

			group.main.pause();
			group.playback.pause();
		});
	}

	public stop(): void {
		AudioPool.logInfo(this.stop, "Forced multi pool stop");

		this.audioPool.forEach((group) => {
			if(group.forcedStop) return;

			group.forcedStop = true;

			// Trigger `ended` event (from playback)
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
