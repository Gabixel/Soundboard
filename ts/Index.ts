//#region Types
type AudioJS = HTMLAudioElement & {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
};
type AudioGroup = { // TODO: rename to singlepoolgroup
	main: AudioJS;
	playback: AudioJS;
	lastTrack: string;
};
type AudioPoolGroup = { // TODO: rename to multipoolgroup
	main: AudioJS;
	mainEnded: boolean;
	playback: AudioJS;
	playbackEnded: boolean;
	forcedEnding: boolean;
};
type SoundButtonData = {
	/**
	 * The (unredered) text
	 */
	title?: string;
	/**
	 * The color (fallback if image fails)
	 */
	color?: {
		h: number;
		s: number;
		l: number;
	};
	/**
	 * 
	 */
	image?: string;
	tags?: string[];
	time?: AudioTimings;
	path?: string;
};
type AudioTimings = {
	/**
	 * Start time (in milliseconds)
	 */
	start: number;
	/**
	 * End time (in milliseconds)
	 */
	end: number;
	/**
	 * Ending condition
	 */
	condition: "at" | "after";
};
//#endregion

init();

async function init() {
	window.addEventListener("dragover", (event) => event.preventDefault());
	window.addEventListener("drop", (event) => event.preventDefault());

	Grid.initGrid($("#buttons-grid"));

	initResizer(); // TODO: move to class

	await AudioPlayer.updateAudioDevicesList();

	// TODO: Extract audio from video file? (probably not necessary)
	// https://stackoverflow.com/questions/49140159/extracting-audio-from-a-video-file
	
	AudioPlayer.setVolumeSlider($("#volume-slider")); // Initializes volume in the audio player

	SoundButton.setGrid(Grid.$grid);

	UiScale.setControls(
		$("#ui-scale-slider"),
		$("#ui-scale-lock"),
		$("#ui-scale-reset")
	);
}

$(document).on("contextmenu", (e) => {
	SoundboardApi.openContextMenu();
});

$(window).on("dragover", (e) => {
	e.preventDefault();
	e.originalEvent.dataTransfer.dropEffect = "none";
	return false;
});
