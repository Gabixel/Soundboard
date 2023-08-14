class SoundButtonCollectionCache {
	private _soundButtonCollection: SoundButtonCollection;
	private _loadedCache: Promise<boolean>;

	constructor(soundButtonCollection: SoundButtonCollection) {
		this._soundButtonCollection = soundButtonCollection;
	}

	public loadCache(): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, 2000);
		});
	}
}
