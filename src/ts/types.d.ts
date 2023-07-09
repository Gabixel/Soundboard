type AnyFunc<T> = (...any: any[]) => T;

type AudioEffect = "GainNode" | "BiquadFilterNode";
type AudioSourceOptions = {
	src?: string;
	audioTimings?: AudioTimings;
};

/**
 * Sound button metadata
 */
// Keep updated with "~/src/ts/types.d.ts"
type SoundButtonData = {
	/**
	 * The unrendered text
	 */
	title?: string;
	/**
	 * The color (fallback if image is failing/missing)
	 */
	color?: Color.HSL;

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

type SoundButtonProperties =
	| "title"
	| "color"
	| "image"
	| "tags"
	| "time"
	| "path";

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
