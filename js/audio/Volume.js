$("#volume")
    .on("input", () => {
    AudioPlayer.volume = $("#volume").val() / 1000;
})
    .on("wheel", (e) => EventFunctions.updateInputFromWheel(e, 50, true, ["input"]));
