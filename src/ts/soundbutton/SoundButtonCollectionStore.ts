/**
 * The collection manager for sound buttons.
 */
class SoundButtonCollectionStore {
	private _collections: SoundButtonDataCollection[] = [];

	public get isEmpty(): boolean {
		return this._collections.length == 0;
	}

	public get length(): number {
		return this._collections.length;
	}

	constructor(existingCollections?: SoundButtonDataCollection[]) {
		if (existingCollections) {
			this.addExistingCollections(existingCollections);
		}
	}

	public addNewCollection(): SoundButtonDataCollection {
		let id = this.findFirstFreeId();
		let name = `Collection ${id + 1}`;

		let collection: SoundButtonDataCollection = {
			id,
			name,
			isCached: false,
			buttonData: [],
			focused: false,
		};

		// Add element to the free id
		this._collections.splice(collection.id, 0, collection);

		return collection;
	}

	public addExistingCollections(collections: SoundButtonDataCollection[]): void {
		this._collections.push(...collections);
	}

	public getCollection(id: number): SoundButtonDataCollection {
		let collection = this._collections.filter(
			(collection) => collection.id == id
		)?.[0];

		if (!collection) {
			throw new ReferenceError(`Collection not found with index "${id}"`);
		}

		return collection;
	}

	public getActiveCollection(): SoundButtonDataCollection {
		let collection = this._collections.filter(
			(collection) => collection.focused
		)?.[0];

		if (!collection) {
			throw new ReferenceError("No collection is focused");
		}

		return collection;
	}

	public getAllCollections(): SoundButtonDataCollection[] {
		return this._collections;
	}

	public getButtonData(index: number, collectionId?: number): SoundButtonData {
		collectionId ??= this.getActiveCollection().id;

		let collection = this.getCollection(collectionId);

		let data = collection.buttonData.filter((data) => data.index == index)?.[0];

		if (!data) {
			throw new ReferenceError(
				`Button data not found with index "${index}" in collection "${collectionId}"`
			);
		}

		return data;
	}

	public changeName(id: number, name: string): void {
		let collection = this.getCollection(id);

		collection.name = name;
	}

	private findFirstFreeId(): number {
		let freeId = 0;

		for (const collection of this._collections) {
			if (collection.id === freeId) {
				freeId++;
			} else {
				break;
			}
		}

		return freeId;
	}
}
