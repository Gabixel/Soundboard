class AudioPool {
    audioPool = [];
    add(audioGroup) {
        this.audioPool.push(audioGroup);
        $(audioGroup.playback).one("ended", () => {
            console.log("audio ended, trying to remove...");
            this.remove(audioGroup);
        });
    }
    remove(removingItem) {
        console.log(typeof removingItem);
    }
    async play() {
        this.audioPool.forEach(async (group) => {
            if (group.forcedEnding)
                return;
            await group.main.play();
            await group.playback.play();
        });
    }
    pause() {
        this.audioPool.forEach((group) => {
            if (group.forcedEnding)
                return;
            group.main.pause();
            group.playback.pause();
        });
    }
    stop() {
        this.audioPool.forEach((group) => {
            group.forcedEnding = true;
            group.main.volume = group.playback.volume = 0;
            group.main.currentTime = group.main.duration;
            group.playback.currentTime = group.playback.duration;
        });
    }
    set volume(value) {
        this.audioPool.forEach((group) => {
            if (group.forcedEnding)
                return;
            group.main.volume = group.playback.volume = value;
        });
    }
    get isPlaying() {
        return this.audioPool.some((group) => group.main.paused === false || group.playback.paused === false);
    }
    get hasAudio() {
        return this.audioPool.length > 0;
    }
}
