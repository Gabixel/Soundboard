function fixJQueryPassiveEvents() {
	console.log("test");

	jQuery.event.special.touchstart = {
		setup: function (_, ns, handle) {
			//@ts-ignore
			this.addEventListener("touchstart", handle, {
				passive: !ns.includes("noPreventDefault"),
			});
		},
	};
	jQuery.event.special.touchmove = {
		setup: function (_, ns, handle) {
			//@ts-ignore
			this.addEventListener("touchmove", handle, {
				passive: !ns.includes("noPreventDefault"),
			});
		},
	};
	jQuery.event.special.wheel = {
		setup: function (_, ns, handle) {
			//@ts-ignore
			this.addEventListener("wheel", handle, { passive: true });
		},
	};
	jQuery.event.special.mousewheel = {
		setup: function (_, ns, handle) {
			//@ts-ignore
			this.addEventListener("mousewheel", handle, { passive: true });
		},
	};
}

// On page load
$(initMainWindow);

async function initMainWindow() {
	fixJQueryPassiveEvents();

	// Show application
	$(document.body).find("#soundboard").attr("style", "opacity: 1");

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

	$(document).on("contextmenu", (e) => {
		SoundboardApi.openContextMenu();
	});

	$(window).on("dragover", (e) => {
		e.preventDefault();
		e.originalEvent.dataTransfer.dropEffect = "none";
		return false;
	});
}

//#region Types
type AudioJS = HTMLAudioElement & {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
};
type AudioGroup = {
	// TODO: rename to singlepoolgroup
	main: AudioJS;
	playback: AudioJS;
	lastTrack: string;
};
type AudioPoolGroup = {
	// TODO: rename to multipoolgroup
	main: AudioJS;
	mainEnded: boolean;
	playback: AudioJS;
	playbackEnded: boolean;
	forcedEnding: boolean;
};
type SoundButtonData = {
	/**
	 * The (unrendered) text
	 */
	title?: string;
	/**
	 * The color (fallback if image fails)
	 */
	color?: {
		/**
		 * Hue
		 */
		h: number;
		/**
		 * Saturation
		 */
		s: number;
		/**
		 * Lightness
		 */
		l: number;
	};
	/**
	 * The background image
	 */
	image?: string;
	/**
	 * Search tags
	 */
	tags?: string[];
	/**
	 * The audio start/end timestamp conditions
	 */
	time?: AudioTimings;
	/**
	 * Audio file path
	 */
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
	// TODO: better explanation of 'condition'
	/**
	 * Ending condition
	 */
	condition: "at" | "after";
};
//#endregion
