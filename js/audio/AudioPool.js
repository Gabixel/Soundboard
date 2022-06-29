class AudioPool extends LogExtend {
    audioPool = [];
    add(group) {
        AudioPool.log(this.add, "Adding group to pool:", group);
        this.audioPool.push(group);
        $(group.playback).one("ended", () => {
            this.remove(group);
            group = null;
        });
    }
    remove(removingGroup) {
        const index = this.audioPool.indexOf(removingGroup);
        AudioPool.log(this.remove, "Removing pool:", removingGroup);
        this.audioPool.splice(index, 1);
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
        AudioPool.log(this.remove, "Forced pool stop");
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
    get length() {
        return this.audioPool.length;
    }
    get multiLength() {
        return this.audioPool.length * 2;
    }
    get hasAudio() {
        return this.audioPool.length > 0;
    }
}
