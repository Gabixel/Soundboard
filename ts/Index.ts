async function test() {
	const devices = await navigator.mediaDevices.enumerateDevices();
	const audioDevices = devices.filter((device) => device.kind === "audiooutput");

	const audioElement = new Audio();
	// @ts-ignore: Property 'setSinkId' does not exist on type 'HMLAudioElement'. ts(2339)
	await audioElement.setSinkId(audioDevices[0].deviceId);

	// @ts-ignore: Property 'sinkId' does not exist on type 'HMLAudioElement'. ts(2339)
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

// $("#play-pause-audio").on("click", () => {
	
// });
