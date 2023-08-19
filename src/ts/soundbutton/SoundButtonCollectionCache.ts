class SoundButtonCollectionCache {
	private _collectionStore: SoundButtonCollectionStore;
	private _loadedCache: Promise<boolean>;

	constructor(collectionStore: SoundButtonCollectionStore) {
		this._collectionStore = collectionStore;
	}

	public loadCache(): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, 200);
		});
	}
}
