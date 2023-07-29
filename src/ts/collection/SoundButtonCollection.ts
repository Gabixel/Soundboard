/**
 * The collection manager for sound buttons.
 */
class SoundButtonCollection {
	private _collections: SoundButtonDataCollection[];

	public getCollection(id: number): SoundButtonDataCollection {
		let collection = this._collections.filter((collection) => collection.id == id)?.[0];

		if(!collection) {
			throw new ReferenceError(`Collection not found with index "${id}"`);
		}

		return collection;
	}
	
	public changeName(id: number, name: string): void {
		let collection = this.getCollection(id);

		collection.name = name;
	}
}
