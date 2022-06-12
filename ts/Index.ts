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
	title: string;
	color: {
		h: number;
		s: number;
		l: number;
	};
	image: string;
	tags: string[];
	path: string;
	index: number;
};
//#endregion

init();

async function init() {
	$(window).on("dragover", null, false, (e) => {
		e.preventDefault();
		e.originalEvent.dataTransfer.dropEffect = "none";
		return false;
	});
	// $(window).on("drop", null, false, (e) => {
	// 	e.preventDefault();
	// 	return false;
	// });

	window.addEventListener("dragover", (event) => event.preventDefault());
	window.addEventListener("drop", (event) => event.preventDefault());

	$("#grid-rows, #grid-columns").trigger("change"); // Initializes grid
	await AudioPlayer.updateAudioDevicesList();
	$("#volume").trigger("input"); // Initializes volume in the audio player

	$(document).on("contextmenu", (e) => {
		SoundBoardApi.openContextMenu();
	});

	SoundButton.setGrid($("#buttons-grid"));
	SoundButton.initClick();
	SoundButton.initContextMenu();

	UiScale.setSlider($("#ui-scale"));
	UiScale.setLock($("#ui-scale-lock"));
	UiScale.setReset($("#ui-scale-reset"));
	UiScale.initWheelShortcut();
}
