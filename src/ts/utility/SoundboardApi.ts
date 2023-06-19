abstract class SoundboardApi extends Logger {
	public static get isProduction(): boolean {
		return this._api.isProduction;
	}

	public static Global = {
		path: {
			initRoot: async () => {
				this.Global.path.root = await this._api.getAppPath();
				this.Global.path.initRoot = null;
				return this.Global.path.root;
			},
			root: "", // Needs initialization at runtime with the above
			resources: "/resources/",
			sounds: "/resources/sounds/",
		},

		// TODO:
		// public static isPathFile(_path: string): boolean {
		// 	// return this._api.isPathFile(path);
		// 	return false;
		// }
	};

	public static MainWindow = {
		openContextMenu: (args: ContextMenuArgs = null): void => {
			this.logDebug(
				this.MainWindow.openContextMenu,
				`Opening context menu with ${
					args != null ? Object.keys(args).length : 0
				} extra args:`,
				args
			);

			this._api.openContextMenu(args);
		},

		joinPaths: async (...paths: string[]): Promise<string> => {
			return this._api.joinPaths(...paths);
		},

		onButtonDataUpdate: (
			callback: (id: string, buttonData: SoundButtonData) => void
		): void => {
			this._api.onButtonDataUpdate(callback);
		},
	};

	public static EditButtonWindow = {
		getButtonData: async (): Promise<{
			id: string;
			buttonData: SoundButtonData;
		}> => {
			return this._api.getButtonData();
		},

		updateButtonData: async (id: string, buttonData: SoundButtonData): Promise<void> => {
			return this._api.updateButtonData(id, buttonData);
		},
	};

	private static get _api(): WindowApiBridge {
		return window.api;
	}
}

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
	onButtonDataUpdate: (
		callback: (id: string, buttonData: SoundButtonData) => void
	) => void;

	/*
	 * EditButtonWindow
	 */
	getButtonData: () => Promise<{
		id: string;
		buttonData: SoundButtonData;
	}>;
	updateButtonData: (id: string, buttonData: SoundButtonData) => Promise<void>;
	// TODO:
	// setButtonData: (buttonData: SoundButtonData) => void;
};