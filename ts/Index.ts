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
AudioPlayer.updateAudioDevicesList();
$("#volume").trigger("input"); // Initializes volume in the audio player

$(document).on("wheel", (e) => {
	if (!e.ctrlKey) return;

	const value = EventFunctions.getUpdatedValueFromWheel(
		e,
		parseFloat($(document.body).css("zoom").toString()),
		0.08,
		[0.8, 1.5]
	).toString();

	$(document.body).stop(true, false);
	$("#ui-scale").val(value);
	$(document.body).css("zoom", value);
});

SoundButton.setGrid($("#buttons-grid"));
SoundButton.setClick();
SoundButton.setContextMenu();

$(document).on("contextmenu", (e) => {
	SoundBoardApi.openContextMenu();
});
