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

	public clearCollection(id: number): void {
		let collection = this.getCollection(id);

		collection.buttonData = [];
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
			throw new ReferenceError("No collection is active (focused)");
		}

		return collection;
	}

	public setActiveCollection(id: number): void {
		let collection = this.getCollection(id);

		this._collections.forEach((collection) => (collection.focused = false));

		collection.focused = true;
	}

	public setCollectionName(id: number, name: string): void {
		let collection = this.getCollection(id);

		collection.name = name;
	}

	public getAllCollections(): SoundButtonDataCollection[] {
		return this._collections;
	}

	public getButtonData(
		buttonId: number,
		collectionId?: number
	): SoundButtonData {
		collectionId ??= this.getActiveCollection().id;

		let buttonData = this.findButtonData(buttonId, collectionId);

		if (!buttonData) {
			throw new ReferenceError(
				`Button data not found with index "${buttonId}" in collection "${collectionId}"`
			);
		}

		return buttonData;
	}

	public editButtonData(
		buttonId: number,
		collectionId: number,
		buttonData: SoundButtonData
	): void {
		let collection = this.getCollection(collectionId);

		let buttonDataIndex = this.findButtonDataIndex(buttonId, collectionId);

		// TODO: can probably be suppressed
		if (buttonDataIndex == -1) {
			throw new ReferenceError(
				`Button data not found with index "${buttonId}" in collection "${collectionId}"`
			);
		}

		// TODO: make button data a class instead of an object?
		// TODO: add a way to reset buttons
		buttonData.isEdited = true;
		collection.buttonData[buttonDataIndex] = buttonData;
	}

	public swapButtonData(
		collectionId: number,
		dataId1: number,
		dataId2: number
	): void {
		let data1 = this.getButtonData(dataId1, collectionId);
		let data2 = this.getButtonData(dataId2, collectionId);

		data1.index = dataId2;
		data2.index = dataId1;
	}

	public changeName(id: number, name: string): void {
		let collection = this.getCollection(id);

		collection.name = name;
	}

	public addButtonDataIfMissing(
		collectionId: number,
		data: SoundButtonData
	): void {
		let collection = this.getCollection(collectionId);

		const idAlreadyExists = collection.buttonData.some(
			(d) => d.index == data.index
		);

		if (idAlreadyExists) {
			return;
		}

		collection.buttonData.push(data);
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

	private findButtonData(
		buttonId: number,
		collectionId: number
	): SoundButtonData | null {
		return this.getCollection(collectionId).buttonData.filter(
			(data) => data.index == buttonId
		)?.[0];
	}

	private findButtonDataIndex(buttonId: number, collectionId: number): number {
		return this.getCollection(collectionId).buttonData.findIndex(
			(data) => data.index == buttonId
		);
	}
}
