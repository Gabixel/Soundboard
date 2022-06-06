class SoundButton {
    static paths = [
        "file:///G:/DownloadVideo/Epic%20Inception%20Sound%20Effect.mp3",
        "file:///G:/DownloadVideo/Fazlija%20-%20Helikopter.mp3",
        "file:///G:/DownloadVideo/Bad%20to%20the%20bone.mp3",
    ];
    static getRandomPath() {
        return this.paths[EMath.randomInt(0, this.paths.length)];
    }
    static generateRandom(index) {
        let [h, s, l] = [
            EMath.randomInt(0, 361),
            EMath.randomInt(0, 100),
            EMath.randomInt(30, 100),
        ];
        let data = {
            title: index.toString(),
            color: { h, s, l },
            image: "",
            tags: "",
            path: this.getRandomPath(),
            index: index,
        };
        return SoundButton.generate(data);
    }
    static generate(data) {
        const $button = $(`<button type="button" class="soundbutton">${data.title}</button>`);
        this.applyData($button, data);
        return $button[0];
    }
    static applyData($button, data) {
        $button
            .attr("id", "sound_btn_" + data.index)
            .attr("tabindex", data.index)
            .css("--index", data.index.toString())
            .data("path", data.path)
            .css("--hue", data.color.h.toString())
            .css("--saturation", data.color.s.toString() + "%")
            .css("--lightness", data.color.l.toString() + "%");
    }
}
