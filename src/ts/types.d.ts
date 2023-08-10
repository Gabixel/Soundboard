type float = number;

type Class = { new (): any };

type Func<T> = (...any: any[]) => T;
type AnyFunc = Func<any>;

type AudioEffect = "GainNode" | "BiquadFilterNode";
type AudioSourceOptions = {
	src: string;
	volume: float;
	audioTimings: AudioTimings;
	loop?: boolean;
};

/**
 * A collection of {@link SoundButtonData}.
 */
type SoundButtonDataCollection = {
	/**
	 * Id for the order in the tab list.
	 */
	id: number;
	/**
	 * Visible name in the tab list.
	 */
	name: string;
	/**
	 * To check if the collection is stored in the user's files.
	 */
	isCached: boolean;
	/**
	 * The list of button data of the collection.
	 */
	buttons: SoundButtonData[];
};

type SoundButtonElement = HTMLButtonElement;
/**
 * JQuery variant of the {@link SoundButtonElement} type.
 */
type SoundButtonElementJQuery = JQuery<SoundButtonElement>;

/**
 * Sound button metadata.
 */
// Keep updated with "~/app/types.d.ts"
interface SoundButtonData {
	/**
	 * To check if the user has changed any value of the button, in which case it will be cached.
	 * Do not store this on the main.
	 */
	isEdited: boolean;

	/**
	 * The position of the sound button.
	 */
	index: number;
	/**
	 * The unrendered text.
	 */
	title?: string;
	/**
	 * The color (fallback if image is failing/missing).
	 */
	color?: Color.HSL;
	/**
	 * The background image.
	 */
	image?: string;
	/**
	 * Search tags.
	 */
	tags?: string[];
	/**
	 * The audio start/end timestamp conditions.
	 */
	time?: AudioTimings;
	/**
	 * Desired volume for the audio.
	 */
	volume?: float;
	/**
	 * Audio file path.
	 */
	path?: string;
}

type SoundButtonDataNoId = Omit<SoundButtonData, "index">;

/**
 * Timings settings for the {@link SoundButtonData}
 */
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

namespace Color {
	type HSL = {
		/**
		 * Hue.
		 */
		h: number;
		/**
		 * Saturation.
		 */
		s: number;
		/**
		 * Lightness.
		 */
		l: number;
	};
}

// Keep updated with:
// - "~/app/types.d.ts"
type ContextMenuArgs =
	| null
	| (
			| { type: "soundbutton"; id: string; buttonData: SoundButtonData }
			| { type: "test1"; coolThing: number }
			| { type: "test999"; a: 1; b: 2 }
	  );

type LoggerStyleAttributes = {
	text: string;
	style: string[];
};
