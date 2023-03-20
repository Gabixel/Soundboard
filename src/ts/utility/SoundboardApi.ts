abstract class SoundboardApi extends Logger {
	/* Global */
	public static get isProduction(): boolean {
		return window.api.isProduction;
	}

	public static resolveAppPath(...path: string[]): string {
		return window.api.resolveAppPath(...path);
	}

	/* MainWindow */
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

	/* EditButtonWindow */
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
	/* Global */
	isProduction: boolean;
	resolveAppPath: (...path: string[]) => string;

	/* MainWindow */
	openContextMenu: (args: ContextMenuArgs) => void;
	isPathFile: (args: string) => boolean;
	joinPaths: (...paths: string[]) => string;

	/* EditButtonWindow */
	getButtonData: (
		callback: (buttonData: SoundButtonData) => void
	) => void;
	// TODO:
	// setButtonData: (buttonData: SoundButtonData) => void;
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
