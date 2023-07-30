/**
 * The collection manager for sound buttons.
 */
class SoundButtonCollection {
	private _collections: SoundButtonDataCollection[] = [];

	public addNewCollection(name: string): SoundButtonDataCollection {
		let collection: SoundButtonDataCollection = {
			id: this.findFirstFreeId(),
			name,
			isCached: false,
			buttons: [],
		};

		// Add element to that index
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
