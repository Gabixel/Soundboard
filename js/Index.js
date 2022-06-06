async function test() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter((device) => device.kind === "audiooutput");
    const audioElement = new Audio();
    await audioElement.setSinkId(audioDevices[0].deviceId);
    console.log("Audio is being played on " + audioElement.sinkId);
    console.log("Audio devices:");
    console.log(audioDevices);
}
$("#grid-rows, #grid-columns").trigger("change");
$("#stop-audio").on("click", async () => {
    AudioPlayer.stop();
});
$("#buttons-grid").on("click", ".soundbutton", (e) => {
    const $button = $(e.target);
    const path = $button.data("path");
    AudioPlayer.playAudio(path);
});
$("#change-sink").on("click", () => {
});
