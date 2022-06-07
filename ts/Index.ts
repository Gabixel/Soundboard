//#region Types
type AudioJS = HTMLAudioElement & {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
};
type AudioGroup = {
	main: AudioJS;
	playback: AudioJS;
	lastTrack?: string;
	forcedEnding?: boolean;
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
