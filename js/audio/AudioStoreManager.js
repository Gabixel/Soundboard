class AudioStoreManager extends LogExtend {
    singlePool = {
        main: new Audio(),
        playback: new Audio(),
        lastTrack: "",
    };
    multiPool = new AudioPool();
    constructor(volume = 0) {
        super();
        this.singlePool.main.volume = this.singlePool.playback.volume = volume;
        $(this.singlePool.main)
            .add(this.singlePool.playback)
            .on("canplay", (e) => {
            AudioStoreManager.log(null, "Audio can play");
            this.playGroup(this.singlePool);
        })
            .on("error", (e) => {
            AudioStoreManager.error(null, "Error loading audio\n", `(Code ${e.target.error.code}) "${e.target.error.message}"\n`, e);
        });
    }
    updateAudioDevice(device) {
        this.singlePool.main.setSinkId(device.deviceId);
    }
    addToSinglePool(path, time) {
        this.stopMultiPoolAudio();
        if (this.singlePool.lastTrack !== path) {
            AudioStoreManager.log(this.addToSinglePool, "New path different from previous one.\n", `• Last track path: "${this.singlePool.lastTrack}"\n`, `• New track path:  "${path}"`);
            this.singlePool.lastTrack = path;
            this.singlePool.main.src = this.singlePool.playback.src = path;
            AudioStoreManager.log(this.addToSinglePool, `Setting new path: "%c%s%c"`, "font-style: italic", path, "");
            this.singlePool.main.load();
            this.singlePool.playback.load();
        }
        const timeInSeconds = time.start === 0 ? time.start : time.start / 1000;
        this.singlePool.main.currentTime = this.singlePool.playback.currentTime =
            timeInSeconds;
    }
    addToMultiPool(audioGroup) {
        if (this.multiPool.length > 50) {
            AudioStoreManager.log(this.addToMultiPool, "Pool limit exceeded.");
            return;
        }
        AudioStoreManager.log(this.addToMultiPool, "Adding new group to multi pool:", audioGroup);
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
        group.main.play();
        group.playback.play();
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
