//#region Types
type AudioJS = HTMLAudioElement & {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
};
type AudioGroup = {
	main: AudioJS;
	playback: AudioJS;
	lastTrack: string;
};
type AudioPoolGroup = {
	main: AudioJS;
	mainEnded: boolean;
	playback: AudioJS;
	playbackEnded: boolean;
	forcedEnding: boolean;
};
type SoundButtonData = {
	index: number;
	title: string;
	color: {
		h: number;
		s: number;
		l: number;
	};
	image: string;
	tags: string[];
	path: string;
};
//#endregion

init();

async function init() {
	// $(window).on("drop", null, false, (e) => {
	// 	e.preventDefault();
	// 	return false;
	// });

	window.addEventListener("dragover", (event) => event.preventDefault());
	window.addEventListener("drop", (event) => event.preventDefault());

	$("#grid-rows, #grid-columns").trigger("change"); // Initializes grid
	await AudioPlayer.updateAudioDevicesList();

	// TODO: Extract audio from video file?
	// https://stackoverflow.com/questions/49140159/extracting-audio-from-a-video-file
	
	AudioPlayer.setVolumeSlider($("#volume-slider")); // Initializes volume in the audio player

	SoundButton.setGrid($("#buttons-grid"));

	UiScale.setControls(
		$("#ui-scale-slider"),
		$("#ui-scale-lock"),
		$("#ui-scale-reset")
	);
}

$(document).on("contextmenu", (e) => {
	SoundboardApi.openContextMenu();
});

$(window).on("dragover", null, false, (e) => {
	e.preventDefault();
	e.originalEvent.dataTransfer.dropEffect = "none";
	return false;
});
