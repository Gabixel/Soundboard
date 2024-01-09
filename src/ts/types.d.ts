type float = number;

type Class = { new (): any };

type Func<T> = (...any: any[]) => T;
type AnyFunc = Func<any>;

type GridAxis = {
	name: "rows" | "columns";
	$input: JQuery<HTMLInputElement>;
	value: number;
	previousValue: number;
	semaphore: Semaphore;
};

type AudioEffect = "GainNode" | "BiquadFilterNode";
type AudioSourceSettings = {
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
	buttonData: SoundButtonData[];
	/**
	 * If the collection was the last one to be focused.
	 */
	focused: boolean;
};

type SoundButtonElement = HTMLButtonElement;
/**
 * JQuery variant of the {@link SoundButtonElement} type.
 */
type SoundButtonElementJQuery = JQuery<SoundButtonElement>;

type GridElement = HTMLDivElement;
/**
 * JQuery variant of the {@link GridElement} type.
 */
type GridElementJQuery = JQuery<GridElement>;

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
 * Timings settings for {@link SoundButtonData}.
 */
type AudioTimings = {
	/**
	 * Start time (in milliseconds).
	 */
	start: number;
	/**
	 * End time (in milliseconds).
	 */
	end: number;
	/**
	 * Ending condition for the audio. Possible values:
	 * - `"at"`: the audio will stop at the {@link AudioTimings.end `end`} timestamp
	 * - `"after"`: the audio will stop after N milliseconds from the start time (using the {@link AudioTimings.end `end`} time as duration)
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
			| { type: "soundbutton"; parsedId: string; buttonData: SoundButtonData }
			| { type: "test1"; coolThing: number }
			| { type: "test999"; a: 1; b: 2 }
	  );

type LoggerStyleAttributes = {
	text: string;
	style: string[];
};

type LoggerAnyExtraArgs =
	| LoggerAnyExtraArgs
	| (LoggerExtraArgs & any)
	| (LoggerExtraArgs | any);

type LoggerExtraArgs = {
	class: Class;
	function?: AnyFunc;
};

interface GridFilterCondition<TDataValues = any> {
	id: string;
	name: string;
	/**
	 * If this condition is active.
	 */
	isActive: boolean;
	$input: JQuery<HTMLInputElement>;
	check: (
		buttonData: SoundButtonData,
		filter: string[],
		filterData: Map<string, GridFilterData>
	) => boolean;
	data: Map<string, GridFilterData<TDataValues>> | null;
}

interface GridFilterData<TValue = any>
	extends Omit<GridFilterCondition<TValue>, "isActive" | "check" | "data"> {
	value: TValue;
}

interface GridFilterInput<TElement = HTMLInputElement>
	extends JQuery<TElement> {
	val(value_function: string): this;
	val(): string | undefined;
}

type FlattenKeysBlackList = "color";

type FlattenKeys<T> = T extends object
	? {
			[K in keyof T & string]: K extends FlattenKeysBlackList
				? `${K & string}`
				: K extends string
				? `${K & string}${string &
						(T[K] extends any[]
							? ""
							: T[K] extends object
							? `-${FlattenKeys<T[K]>}`
							: "")}`
				: never;
	  }[keyof T & string]
	: never;

type FlattenedSoundButtonDataKeys = FlattenKeys<SoundButtonData>;
