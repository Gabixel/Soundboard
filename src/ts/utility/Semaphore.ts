class Semaphore {
	private _locked: boolean = false;

	public get isLocked(): boolean {
		return this._locked;
	}

	constructor(initialValue: boolean = false) {
		this._locked = initialValue;
	}
	/**
	 * @returns {boolean} Returns `true` if the lock was successful (meaning that it was not locked before), `false` otherwise.
	 */
	public lock(): boolean {
		return !this._locked && (this._locked = true);
	}

	/**
	 * @returns {boolean} Returns `true` if the unlock was successful (meaning that it was locked before), `false` otherwise.
	 */
	public unlock(): boolean {
		return this._locked && !(this._locked = false);
	}
}
