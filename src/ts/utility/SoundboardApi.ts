abstract class SoundboardApi extends Logger {
	public static get isProduction(): boolean {
		return this._api.isProduction;
	}

	public static resolveAppPath(...path: string[]): string {
		return this._api.resolveAppPath(...path);
	}

	public static openContextMenu(args: ContextMenuArgs = null): void {
		this.logDebug(
			this.openContextMenu,
			`Opening context menu with ${
				args != null ? Object.keys(args).length : 0
			} extra args:`,
			args
		);

		this._api.openContextMenu(args);
	}

	// TODO:
	public static isPathFile(_path: string): boolean {
		// return this._api.isPathFile(path);
		return false;
	}

	public static joinPaths(...paths: string[]): string {
		return this._api.joinPaths(...paths);
	}

	private static get _api(): WindowApiBridge {
		return window.api;
	}
}

//#region Types
// Keep updated:
// - "~/app/windows/mainWindow/preload.ts" - MainWindow
// - "~/app/windows/editButtonWindow/preload.ts" - EditButtonWindow
type WindowApiBridge = {
	/*
	 * Global
	 */
	isProduction: boolean;

	/*
	 * MainWindow
	 */
	resolveAppPath: (...path: string[]) => string;
	openContextMenu: (args: ContextMenuArgs) => void;
	isPathFile: (args: string) => boolean;
	joinPaths: (...paths: string[]) => string;

	/*
	 * EditButtonWindow
	 */
	// TODO:
	// editButton: (buttonData: SoundButtonData) => void;
};

// Keep updated with:
// - "~/app/windows/main.ts"
type ContextMenuArgs =
	| null
	| (
			| { type: "soundbutton"; buttonData: SoundButtonData }
			| { type: "test1"; coolThing: number }
			| { type: "test999"; a: 1; b: 2 }
	  );
//#endregion
