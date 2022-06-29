class AudioPlayer extends LogExtend {
    static _volume = 0;
    static $volumeSlider;
    static maxSliderValue = 1000;
    static canLogVolume = true;
    static audioStore = new AudioStoreManager();
    static audioDevices;
    static async updateAudioDevicesList() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.audioDevices = devices.filter(({ kind }) => kind === "audiooutput");
        this.audioStore.updateAudioDevice(this.audioDevices[2]);
        this.log(this.updateAudioDevicesList, "Devices list updated!\n", this.audioDevices);
    }
    static setVolumeSlider($slider) {
        this.log(this.setVolumeSlider, "Slider set!\n", $slider);
        this.$volumeSlider = $slider;
        this.maxSliderValue = parseInt(this.$volumeSlider.attr("max"));
        this.updateVolume();
        this.initSlider();
    }
    static initSlider() {
        this.$volumeSlider
            .on("input", () => {
            this.updateVolume();
        })
            .on("wheel", (e) => {
            EventFunctions.updateInputValueFromWheel(e, 50, true, ["input"]);
        });
    }
    static addAudio(path, time, useMultiPool = false) {
        this.log(this.addAudio, `Using path "%c${path}%c"%s`, "font-style: italic", "font-style: normal", "\n- Start time:", time.start, "(ms)\n- End time:", time.end, `(ms)\n- Type: "${time.condition}"`);
        this.tryAddAudio(path, time, useMultiPool);
    }
    static tryAddAudio(path, time, useMultiPool) {
        if (!useMultiPool) {
            this.audioStore.addToSinglePool(path, time);
            return;
        }
        let mainAudio = new Audio(path);
        $(mainAudio)
            .one("canplay", (e) => {
            this.log(this.tryAddAudio, "Audio file created. Duration: " + e.target.duration + " seconds");
            this.storeAudio(e.target, time);
        })
            .one("error", (e) => {
            this.error(this.tryAddAudio, "Error loading audio\n", `(Code ${e.target.error.code}) "${e.target.error.message}"\n`, e);
        });
    }
    static async storeAudio(mainAudio, time) {
        const main = mainAudio;
        const playback = mainAudio.cloneNode();
        const group = {
            main,
            mainEnded: false,
            playback,
            playbackEnded: false,
            forcedEnding: false,
        };
        main.volume = playback.volume = this.volume;
        main.currentTime = playback.currentTime = time.start / 1000;
        await this.setSinkId(main);
        this.audioStore.addToMultiPool(group);
    }
    static async setSinkId(audio) {
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
    static updateVolume() {
        let value = this.$volumeSlider.val() / this.maxSliderValue;
        value = EMath.getEponentialValue(value, 10);
        this._volume = value;
        this.updateExistingVolumes();
        if (this.canLogVolume) {
            this.canLogVolume = false;
            this.log(this.updateVolume, "Volume:", Math.round(this._volume * 100), "%");
            setTimeout(() => {
                this.canLogVolume = true;
            }, 500);
        }
    }
    static updateExistingVolumes() {
        this.audioStore.setVolume(this._volume);
    }
}
