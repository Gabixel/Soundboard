$("#stop-audio").on("click", async () => {
    Logger.log(null, null, "Stop audio button clicked");
    AudioPlayer.stop();
});
$("#play-pause-audio").on("click", async () => {
    if (AudioPlayer.isPlaying) {
        AudioPlayer.pause();
    }
    else {
        await AudioPlayer.play();
    }
});
