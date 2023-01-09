abstract class SoundboardApi extends Logger {
	public static openContextMenu(args: any = null): void {
		this.logInfo(this.openContextMenu, "Opening context menu with args:", args);

		this._api.openContextMenu(args);
	}

	public static get isProduction(): boolean {
		return this._api.isProduction;
	}

	public static isPathFile(path: string): boolean {
		// return this._api.isPathFile(path);
		return false;
	}

	private static get _api() {
		return (window as any).api as WindowApiBridge;
	}
}

// Keep updated with:
// - "~/app/windows/mainWindow/preload.ts"
// - "~/app/windows/editButtonWindow/preload.ts"
type WindowApiBridge = {
	/*
	 * MainWindowApiBridge
	 */
	openContextMenu: (args: any) => void;
	// isPathFile: (args: string) => boolean;
	isProduction: boolean;

	/*
	 * EditButtonWindowApiBridge
	 */
	// TODO
};
