/**
 * Storage for one or more audio couples. 
 */
class AudioStore extends Logger {
	private _storageLimit: number;
	private _audioCoupleList: AudioCouple[] = [];

	/**
	 * @param storageLimit If the limit is less than 1, there won't be one. By default is `-1` for better readability.
	 */
	constructor(storageLimit: number = -1) {
		super();

		this._storageLimit = storageLimit;
	}

	
}
