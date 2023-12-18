class Semaphore {
	private _locked: boolean = false;

	public get isLocked(): boolean {
		return this._locked;
	}

	constructor(initialValue: boolean = false) {
		this._locked = initialValue;
	}
	/**
	 * Attempts to lock the semaphore (if it isn't already locked).
	 * 
	 * @returns `true` if the lock was successful, `false` otherwise
	 */
	public lock(): boolean {
		return !this._locked && (this._locked = true);
	}

	/**
	 * Attempts to unlock the semaphore (if it isn't already unlocked).
	 * 
	 * @returns `true` if the unlock was successful, `false` otherwise
	 */
	public unlock(): boolean {
		return this._locked && !(this._locked = false);
	}
}
