abstract class Main extends Logger {
	public static async initMainWindow() {
		// Some info for debug
		this.logInfo(
			this.initMainWindow,
			"\nUserAgent:",
			navigator.userAgent,
			"\nMain language:",
			navigator.language,
			"\nLanguages:",
			navigator.languages,
			"\nCookie enabled?",
			navigator.cookieEnabled,
			"\nNavigator:",
			navigator
		);

		fixJQueryPassiveEvents();

		// Reference grid
		Grid.initGrid($("#buttons-grid"));

		// Grid resizer
		initResizer(); // TODO: move to class

		ButtonSwap.initialize();

		// Audio output
		await AudioPlayer.updateAudioDevicesList();

		// TODO: Extract audio from video file? (probably not necessary)
		// https://stackoverflow.com/questions/49140159/extracting-audio-from-a-video-file

		// Initialize volume in the audio player
		AudioPlayer.setVolumeSlider($("#volume-slider"));

		// Initialize sound button generator
		SoundButton.initialize(Grid.$grid);

		// Set UI scale elements
		UiScale.setControls(
			$("#ui-scale-slider"),
			$("#ui-scale-lock"),
			$("#ui-scale-reset")
		);

		// Setup context menu
		// TODO: class?
		$(document).on("contextmenu", () => {
			SoundboardApi.openContextMenu();
		});

		$(window).on("dragover", (e) => {
			e.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = "none";
			return false;
		});

		// Show application
		$(document.body).find("#soundboard").attr("style", "opacity: 1");
	}
}

function fixJQueryPassiveEvents() {
	jQuery.event.special.touchstart = {
		setup: function (_, ns, handle) {
			this.addEventListener(
				"touchstart",
				handle as object as EventListenerOrEventListenerObject,
				{
					passive: !ns.includes("noPreventDefault"),
				}
			);
		},
	};
	jQuery.event.special.touchmove = {
		setup: function (_data, namespace, handle) {
			this.addEventListener(
				"touchmove",
				handle as object as EventListenerOrEventListenerObject,
				{
					passive: !namespace.includes("noPreventDefault"),
				}
			);
		},
	};
	jQuery.event.special.wheel = {
		setup: function (_data, _namespace, handle) {
			this.addEventListener(
				"wheel",
				handle as object as EventListenerOrEventListenerObject,
				{ passive: true }
			);
		},
	};
	jQuery.event.special.mousewheel = {
		setup: function (_data, _namespace, handle) {
			this.addEventListener(
				"mousewheel",
				handle as object as EventListenerOrEventListenerObject,
				{ passive: true }
			);
		},
	};
}

//#region Types
type AnyFunc<T> = (...any: any[]) => T;
type AudioJS = HTMLAudioElement & {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
};
type AudioGroup = {
	// TODO: rename to singlepoolgroup
	main: AudioJS;
	playback: AudioJS;
	$all: JQuery<HTMLAudioElement>;
	all: (func: (audio: AudioJS) => void) => void;
	lastTrack: string;
};
type AudioPoolGroup = {
	// TODO: rename to multipoolgroup
	main: AudioJS;
	playback: AudioJS;
	$all: JQuery<HTMLAudioElement>;
	all: (func: (audio: AudioJS) => void) => void;
	ended: boolean;
	forcedStop: boolean;
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
type ElectronFile = File & {
	path: string;
	name: string;
};
//#endregion

// On page load
$(() => Main.initMainWindow());
