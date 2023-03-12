type AnyFunc<T> = (...any: any[]) => T;

type AudioJS = HTMLAudioElement & {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
};

type AudioGroup = {
	// TODO: rename to singlepoolgroup

	/**
	 * The main audio instance (possibly sent to a virtual channel).
	 */
	main: AudioJS;

	/**
	 * The playback instance (heard from the host machine).
	 */
	playback: AudioJS;

	$all: JQuery<HTMLAudioElement>;
	all: (func: (audio: AudioJS) => void) => void;
	lastTrack: string;
};

type AudioPoolGroup = {
	// TODO: rename to multipoolgroup
	/**
	 * The main audio instance (possibly sent to a virtual channel)
	 */
	main: AudioJS;

	/**
	 * The playback instance (heard from the host machine).
	 */
	playback: AudioJS;

	$all: JQuery<HTMLAudioElement>;
	all: (func: (audio: AudioJS) => void) => void;
	ended: boolean;
	forcedStop: boolean;
};

type SoundButtonData = {
	/**
	 * The unrendered text
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
