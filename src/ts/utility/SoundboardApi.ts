abstract class SoundboardApi extends Logger {
	public static get isProduction(): boolean {
		return window.api.isProduction;
	}

	public static resolveAppPath(...path: string[]): string {
		return window.api.resolveAppPath(...path);
	}

	public static openContextMenu(args: ContextMenuArgs = null): void {
		this.logDebug(
			this.openContextMenu,
			`Opening context menu with ${
				args != null ? Object.keys(args).length : 0
			} extra args:`,
			args
		);

		window.api.openContextMenu(args);
	}

	// TODO:
	public static isPathFile(_path: string): boolean {
		// return window.api.isPathFile(path);
		return false;
	}

	public static joinPaths(...paths: string[]): string {
		return window.api.joinPaths(...paths);
	}

	/**
	 * EditButton Window
	 */
	public static getButtonData(
		callback: (buttonData: SoundButtonData) => void
	): void {
		window.api.getButtonData(callback);
	}
}

//#region Types
// Keep updated:
// - "~/app/windows/mainWindow/preload.ts"
// - "~/app/windows/editButtonWindow/preload.ts"
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
	// TODO: don't wait for main, ask him for data
	getButtonData: (
		callback: (buttonData: SoundButtonData) => void
	) => void;
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
