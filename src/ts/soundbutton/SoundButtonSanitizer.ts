/**
 * Class responsible for sanitizing soundbutton data.
 */
class SoundButtonSanitizer {
	private _defaultData: SoundButtonDataNoId;

	private MAX_TEXT_LENGTH: Readonly<number> = 50;

	private MAX_HUE: Readonly<number> = 360;
	private MAX_SATURATION: Readonly<number> = 100;
	private MAX_LIGHTNESS: Readonly<number> = 100;

	private MAX_VOLUME: Readonly<float> = 2;

	constructor(defaultData: SoundButtonDataNoId) {
		this._defaultData = defaultData;
	}

	public sanitizeData(index: number, data?: SoundButtonData): SoundButtonData {
		const defaultData = this._defaultData;

		return {
			isEdited: !!data,
			index,
			title: data?.title?.slice(0, this.MAX_TEXT_LENGTH) ?? defaultData.title,
			color: {
				h: Math.min(data?.color?.h ?? defaultData.color.h, this.MAX_HUE),
				s: Math.min(data?.color?.s ?? defaultData.color.s, this.MAX_SATURATION),
				l: Math.min(data?.color?.l ?? defaultData.color.l, this.MAX_LIGHTNESS),
			},
			image: data?.image ?? defaultData.image,
			tags: data?.tags ?? defaultData.tags,
			time: {
				start: data?.time?.start ?? defaultData.time.start,
				end: data?.time?.end ?? defaultData.time.end,
				condition: data?.time?.condition === "after" ? "after" : "at",
			},
			volume: Math.min(data?.volume ?? defaultData.volume, this.MAX_VOLUME),
			path: data?.path ?? defaultData.path,
		};
	}
}
