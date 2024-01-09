// Keep updated with "~/src/ts/types.d.ts"
type ContextMenuArgs =
	| null
	| (
			| { type: "soundbutton"; parsedId: string; buttonData: SoundButtonData }
			| { type: "test1"; coolThing: number }
			| { type: "test999"; a: 1; b: 2 }
	  );

/**
 * Sound button metadata.
 */
// Keep updated with "~/src/ts/types.d.ts"
type SoundButtonData = {
	/**
	 * The position of the sound button
	 */
	id: number;
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
