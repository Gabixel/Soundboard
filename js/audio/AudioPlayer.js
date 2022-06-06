class AudioPlayer {
    static _volume = 0.12;
    static audioMain = new Audio();
    static audioTree = [];
    static addingAudio = false;
    static playAudio(path) {
        this.createAudio(path);
    }
    static createAudio(path) {
        let audio = new Audio(path);
        $(audio).one("canplay", (e) => this.addAudio(e.target));
    }
    static async addAudio(audio) {
        if (this.addingAudio)
            return;
        this.addingAudio = true;
        await this.prepareAudio(audio);
        this.addingAudio = false;
    }
    static async prepareAudio(audio) {
        const playback = audio.cloneNode();
        this.audioTree.push(audio);
        this.audioTree.push(playback);
        $(audio).on("ended", this.removeAudio.bind(this, audio));
        $(playback).on("ended", this.removeAudio.bind(this, playback));
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(({ kind }) => kind === "audiooutput");
        const mainDevice = audioDevices[2];
        audio.loop = playback.loop = false;
        audio.volume = playback.volume = this.volume;
        try {
            await audio.play();
            await playback.play();
        }
        catch (e) { }
        await audio.setSinkId(mainDevice.deviceId);
    }
    static stop() {
        this.audioTree.forEach((audio) => {
            $(audio).attr("ending", "true");
            audio.volume = 0;
            audio.currentTime = audio.duration;
        });
    }
    static removeAudio(audio) {
        this.audioTree.splice(this.audioTree.indexOf(audio), 1);
    }
    static get volume() {
        return this._volume;
    }
    static set volume(value) {
        this._volume = EMath.getEponentialVolume(value);
        this.updateExistingVolumes();
    }
    static updateExistingVolumes() {
        this.audioTree.forEach((audio) => {
            if ($(audio).attr("ending") === "true")
                return;
            audio.volume = this.volume;
        });
    }
}
