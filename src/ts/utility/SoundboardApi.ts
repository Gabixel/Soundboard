abstract class SoundboardApi extends Logger {
	public static get isProduction(): boolean {
		return this._api.isProduction;
	}

	public static resolveAppPath(...path: string[]): string {
		return this._api.resolveAppPath(...path);
	}
	public static openContextMenu(args: object = null): void {
		this.logInfo(this.openContextMenu, "Opening context menu with args:", args);

		this._api.openContextMenu(args);
	}

	public static isPathFile(path: string): boolean {
		// return this._api.isPathFile(path);
		return false;
	}

	public static joinPaths(...paths: string[]): string {
		return this._api.joinPaths(...paths);
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
	isProduction: boolean;
	resolveAppPath: (...path: string[]) => string;
	openContextMenu: (args: any) => void;
	isPathFile: (args: string) => boolean;
	joinPaths: (...paths: string[]) => string;

	/*
	 * EditButtonWindowApiBridge
	 */
	// TODO
};
