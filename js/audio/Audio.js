$("#stop-audio").on("click", async () => {
    AudioPlayer.stop();
    updatePlayPauseButton();
});
$("#play-pause-audio").on("click", async () => {
    if (AudioPlayer.isPlaying) {
        AudioPlayer.pause();
    }
    else {
        await AudioPlayer.play();
    }
    updatePlayPauseButton();
});
$("#buttons-grid").on("click", ".soundbutton", (e) => {
    const $button = $(e.target);
    const path = $button.data("path");
    AudioPlayer.addAudio(path, e.shiftKey);
    updatePlayPauseButton();
});
$("#volume")
    .on("input", () => {
    AudioPlayer.volume = $("#volume").val() / 1000;
})
    .on("wheel", (e) => {
    e.preventDefault();
    EventFunctions.updateInputValueFromWheel(e, 50, true, ["input"]);
});
function updatePlayPauseButton() {
    let isPlaying = AudioPlayer.isPlaying;
    let $content = $("#play-pause-audio i.fa-pause, #play-pause-audio i.fa-play");
    if (isPlaying) {
        $content.addClass("fa-pause").removeClass("fa-play");
    }
    else {
        $content.addClass("fa-play").removeClass("fa-pause");
    }
}
