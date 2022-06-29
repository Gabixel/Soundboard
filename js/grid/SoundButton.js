class SoundButton extends LogExtend {
    static paths = [
        "Bad to the bone.mp3",
    ];
    static $grid;
    static dropEffect = "none";
    static getRandomPath() {
        return encodeURI("../../resources/sounds/" + this.paths[EMath.randomInt(0, this.paths.length)]);
    }
    static generateRandom(index) {
        let [h, s, l] = [
            EMath.randomInt(0, 361),
            EMath.randomInt(0, 100),
            EMath.randomInt(30, 100),
        ];
        let data = {
            title: (index + 1).toString(),
            color: { h, s, l },
            image: "",
            tags: [""],
            path: this.getRandomPath(),
            time: {
                start: 0,
                end: 0,
                condition: "after",
            },
        };
        return SoundButton.createWithData(data, index);
    }
    static createWithData(data, index) {
        const $button = $(`<button type="button" class="soundbutton"></button>`);
        $button.append(`<div class="button-theme">${data.title}</div>`);
        this.applyInitialData($button, data, index);
        return $button[0];
    }
    static applyInitialData($button, data, index) {
        $button
            .attr("id", "sound_btn_" + index)
            .attr("tabindex", index + 1)
            .css("--index", index.toString())
            .attr("data-path", data.path)
            .attr("data-tags", data.tags.join(","))
            .attr("data-start-time", data.time.start)
            .attr("data-end-time", data.time.end)
            .attr("data-end-type", data.time.condition)
            .css("--hue", data.color.h.toString())
            .css("--saturation", data.color.s.toString() + "%")
            .css("--lightness", data.color.l.toString() + "%");
        this.addDragAndDrop($button);
    }
    static addDragAndDrop($button) {
        $button
            .on("dragenter", (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = this.dropEffect;
            $button.addClass("file-dragover");
            this.log(this.applyInitialData, "'dragenter' triggered");
        })
            .on("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.originalEvent.dataTransfer.dropEffect = "link";
        })
            .on("drop", (e) => {
            this.log(this.applyInitialData, "'drop' triggered");
            const notSuccesful = !e.originalEvent.dataTransfer ||
                !e.originalEvent.dataTransfer.files.length;
            if (notSuccesful)
                return;
            e.preventDefault();
            e.stopPropagation();
            $button.removeClass("file-dragover");
            const file = e.originalEvent.dataTransfer.files[0];
            const path = file.path;
            const encodedPath = encodeURIComponent(path.replace(/\\/g, "/"))
                .replace(/(%2F)+/g, "/")
                .replace(/(%3A)+/g, ":");
            this.log(this.applyInitialData, "Audio drop successful.\n" +
                "• Files: %O\n" +
                "\t---------\n" +
                "• First file: %O\n" +
                "\t---------\n" +
                "• First file path (encoded for browser): %O", e.originalEvent.dataTransfer.files, e.originalEvent.dataTransfer.files[0], encodedPath);
            SoundboardApi.isPathFile(path);
            $button.attr("data-path", encodedPath);
            $button.children(".button-theme").text(file.name);
        })
            .on("dragleave", (e) => {
            e.preventDefault();
            e.stopPropagation();
            $button.removeClass("file-dragover");
            this.log(this.applyInitialData, "'dragleave' triggered");
        });
    }
    static updateData($button, data) {
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            switch (keys[i]) {
                case "title":
                    break;
            }
        }
    }
    static setGrid(grid) {
        this.$grid = grid;
        this.initClick();
        this.initContextMenu();
    }
    static initContextMenu() {
        this.$grid.on("contextmenu", ".soundbutton", (e) => {
            e.stopPropagation();
            let $target = $(e.target);
            let args = {
                type: "soundbutton",
                x: e.clientX.toString(),
                y: e.clientY.toString(),
                buttonData: {
                    title: $target.children(".button-theme").text(),
                    color: {
                        h: parseInt($target.css("--hue")),
                        s: parseInt($target.css("--saturation")),
                        l: parseInt($target.css("--lightness")),
                    },
                    image: $target.attr("data-image"),
                    tags: $target
                        .attr("data-tags")
                        .split(" ")
                        .filter((tag) => tag.length > 0),
                    path: $target.attr("data-path"),
                    index: parseInt($target.css("--index")),
                },
            };
            SoundboardApi.openContextMenu(args);
        });
    }
    static initClick() {
        this.$grid.on("click", ".soundbutton", (e) => {
            this.log(this.initClick, `SoundButton "%s" clicked`, $(e.target).children(".button-theme").text());
            const $button = $(e.target);
            const path = $button.attr("data-path");
            const time = {
                start: parseInt($button.attr("data-start-time")),
                end: parseInt($button.attr("data-end-time")),
                condition: $button.attr("data-end-type"),
            };
            const useMultiPool = e.shiftKey;
            AudioPlayer.addAudio(path, time, useMultiPool);
        });
    }
}
