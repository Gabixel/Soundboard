class AudioStoreManager {
    singlePool = {
        main: new Audio(),
        playback: new Audio(),
        lastTrack: "",
    };
    multiPool = new AudioPool();
    constructor(volume = 0) {
        this.singlePool.main.volume = this.singlePool.playback.volume = volume;
    }
    updateAudioDevice(device) {
        this.singlePool.main.setSinkId(device.deviceId);
    }
    addAudio(audio) {
        if (typeof audio === "string") {
            this.addToSinglePool(audio);
        }
        else {
            this.addToMultiPool(audio);
        }
    }
    addToSinglePool(path) {
        console.log("setting to single pool");
        this.stopMultiPoolAudio();
        if (this.singlePool.lastTrack !== path) {
            this.singlePool.lastTrack = path;
            this.singlePool.main.src = this.singlePool.playback.src = path;
            this.singlePool.main.load();
            this.singlePool.playback.load();
        }
        else {
            this.singlePool.main.currentTime = this.singlePool.playback.currentTime = 0;
        }
        this.playGroup(this.singlePool);
    }
    addToMultiPool(audioGroup) {
        console.log("adding to multi pool");
        this.multiPool.add(audioGroup);
        this.playGroup(audioGroup);
    }
    async play() {
        if (this.singlePool.lastTrack != "") {
            await this.singlePool.main.play();
            await this.singlePool.playback.play();
        }
        if (this.multiPool.hasAudio)
            await this.multiPool.play();
    }
    pause() {
        this.singlePool.main.pause();
        this.singlePool.playback.pause();
        if (this.multiPool.hasAudio)
            this.multiPool.pause();
    }
    stop() {
        this.singlePool.main.pause();
        this.singlePool.playback.pause();
        this.stopMultiPoolAudio();
        $(this.singlePool.main).add($(this.singlePool.playback)).removeAttr("src");
        this.singlePool.lastTrack = "";
        this.singlePool.main.load();
        this.singlePool.playback.load();
    }
    get isPlaying() {
        return (this.singlePool.main.paused === false ||
            (this.multiPool.hasAudio && this.multiPool.isPlaying));
    }
    playGroup(group) {
        try {
            group.main.play();
            group.playback.play();
        }
        catch (e) {
            console.log(e);
        }
    }
    setVolume(value) {
        this.singlePool.main.volume = this.singlePool.playback.volume = value;
        if (this.multiPool.hasAudio)
            this.multiPool.volume = value;
    }
    stopMultiPoolAudio() {
        if (this.multiPool.hasAudio)
            this.multiPool.stop();
    }
}
