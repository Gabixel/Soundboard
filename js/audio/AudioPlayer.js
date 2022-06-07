class AudioPlayer {
    static _volume = 0;
    static audioStore = new AudioStoreManager();
    static audioDevices;
    static async updateAudioDevicesList() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.audioDevices = devices.filter(({ kind }) => kind === "audiooutput");
        this.audioStore.updateAudioDevice(this.audioDevices[2]);
    }
    static addAudio(path, useMultiPool = false) {
        this.tryAddAudio(path, useMultiPool);
    }
    static tryAddAudio(path, useMultiPool) {
        if (!useMultiPool) {
            this.audioStore.addAudio(path);
            return;
        }
        let audioGroup = new Audio(path);
        $(audioGroup).one("canplay", (e) => {
            this.storeAudio(e.target);
        });
    }
    static async storeAudio(mainAudio) {
        const main = mainAudio;
        const playback = mainAudio.cloneNode();
        const group = {
            main,
            playback,
            forcedEnding: false,
        };
        main.volume = playback.volume = this.volume;
        await this.setAudioDevice(main);
        this.audioStore.addAudio(group);
    }
    static async setAudioDevice(audio) {
        if (!this.audioDevices)
            await this.updateAudioDevicesList();
        await audio.setSinkId(this.audioDevices[2].deviceId);
    }
    static async play() {
        await this.audioStore.play();
    }
    static pause() {
        this.audioStore.pause();
    }
    static stop() {
        this.audioStore.stop();
    }
    static get isPlaying() {
        return this.audioStore.isPlaying;
    }
    static get volume() {
        return this._volume;
    }
    static set volume(value) {
        this._volume = EMath.getEponentialVolume(value);
        this.updateExistingVolumes();
    }
    static updateExistingVolumes() {
        this.audioStore.setVolume(this._volume);
    }
    static setPan(pan) {
    }
}
