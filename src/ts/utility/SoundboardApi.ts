abstract class SoundboardApi extends Logger {
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

	public static async joinPaths(...paths: string[]): Promise<string> {
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
	openContextMenu: (args: ContextMenuArgs) => void;
	// isPathFile: (args: string) => boolean;
	getAppPath: () => Promise<string>;
	joinPaths: (...paths: string[]) => Promise<string>;

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
