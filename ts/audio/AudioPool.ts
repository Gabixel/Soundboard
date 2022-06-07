class AudioPool {
	private audioPool: AudioGroup[] = [];

	public add(audioGroup: AudioGroup): void {
		this.audioPool.push(audioGroup);
		$(audioGroup.playback).one("ended", () => {
			console.log("audio ended, trying to remove...");
			this.remove(audioGroup);
		});
	}

	public remove(removingItem: AudioGroup | AudioJS): void {
		console.log(typeof removingItem); // TODO
		// // if (typeof removingItem) {
		// // } else {
		// // 	this.audioPool.splice(this.audioPool.indexOf(removingGroup), 1);
		// // }
		// this.audioPool = this.audioPool.filter((group) => group !== removingGroup);
		// this.audioPool.splice(this.audioPool.indexOf(this.audioPool.filter((group) => group.main === mainAudio)[0]), 1);
	}

	public async play(): Promise<void> {
		this.audioPool.forEach(async (group) => {
			if (group.forcedEnding) return;

			await group.main.play();
			await group.playback.play();
		});
	}

	public pause(): void {
		this.audioPool.forEach((group) => {
			if(group.forcedEnding) return;

			group.main.pause();
			group.playback.pause();
		});
	}

	public stop(): void {
		this.audioPool.forEach((group) => {
			group.forcedEnding = true;

			group.main.volume = group.playback.volume = 0;

			group.main.currentTime = group.main.duration;
			group.playback.currentTime = group.playback.duration;
		});
	}

	public set volume(value: number) {
		this.audioPool.forEach((group) => {
			if(group.forcedEnding) return;

			group.main.volume = group.playback.volume = value;
		});
	}

	public get isPlaying(): boolean {
		return this.audioPool.some((group) => group.main.paused === false || group.playback.paused === false);
	}

	public get hasAudio(): boolean {
		return this.audioPool.length > 0;
	}
}
