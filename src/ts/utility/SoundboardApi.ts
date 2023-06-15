abstract class SoundboardApi extends Logger {
	/*
	 * Global
	 */

	private static get _api(): WindowApiBridge {
		return window.api;
	}

	public static get isProduction(): boolean {
		return this._api.isProduction;
	}

	public static path = {
		initRoot: async () => {
			this.path.root = await this._api.getAppPath();
			this.path.initRoot = null;
			return this.path.root;
		},
		root: "", // Needs initialization at runtime with the above
		resources: "/resources/",
		sounds: "/resources/sounds/",
	};

	// TODO:
	// public static isPathFile(_path: string): boolean {
	// 	// return this._api.isPathFile(path);
	// 	return false;
	// }

	/*
	 * MainWindow
	 */

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

	public static async joinPaths(...paths: string[]): Promise<string> {
		return this._api.joinPaths(...paths);
	}

	/*
	 * EditButtonWindow
	 */

	public static getButtonData(
		callback: (buttonData: SoundButtonData) => void
	): void {
		this._api.getButtonData(callback);
	}
}

//#region Types
// Keep updated:
// - "~/app/windows/mainWindow/preload.ts"
// - "~/app/windows/editButtonWindow/preload.ts"
type WindowApiBridge = {
	/* Global */
	isProduction: boolean;

	/*
	 * MainWindow
	 */
	openContextMenu: (args: ContextMenuArgs) => void;
	// isPathFile: (args: string) => boolean;
	getAppPath: () => Promise<string>;
	joinPaths: (...paths: string[]) => Promise<string>;

	/*
	 * EditButtonWindow
	 */
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
