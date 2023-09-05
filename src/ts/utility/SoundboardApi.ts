// TODO: don't make this a static class, but rather a singleton
abstract class SoundboardApi {
	public static get isProduction(): boolean {
		return this._api.isProduction;
	}

	public static global = {
		path: {
			/**
			 * Tries to find the applicaton path.
			 */
			retrieveAppPath: async () => {
				this.global.path.root = await this._api.getAppPath();
				this.global.path.retrieveAppPath = null;
			},
			// TODO: try to get rid of this initialization
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

	public static mainWindow = {
		openContextMenu: (args: ContextMenuArgs = null): void => {
			Logger.logDebug(
				`Opening context menu with ${
					args != null ? Object.keys(args).length : 0
				} extra args:`,
				args
			);

			this._api.openContextMenu(args);
		},

		// TODO: try to remove this and use a browser-specific method instead
		joinPaths: async (...paths: string[]): Promise<string> => {
			return this._api.joinPaths(...paths);
		},

		onButtonDataUpdate: (
			callback: (parsedId: string, buttonData: SoundButtonData, reset: boolean) => void
		): void => {
			this._api.onButtonDataUpdate(callback);
		},
	};

	public static editButtonWindow = {
		getButtonData: async (): Promise<{
			parsedId: string;
			buttonData: SoundButtonData;
		}> => {
			return this._api.getButtonData();
		},

		updateButtonData: async (
			parsedId: string,
			buttonData: SoundButtonData
		): Promise<void> => {
			return this._api.updateButtonData(parsedId, buttonData);
		},

		onAskCompareChanges: (callback: () => void): void => {
			this._api.onAskCompareChanges(callback);
		},

		sendCompareChanges: async (
			id: string,
			buttonData: SoundButtonData
		): Promise<void> => this._api.sendCompareChanges(id, buttonData),
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
		callback: (id: string, buttonData: SoundButtonData, reset: boolean) => void
	) => void;

	/*
	 * EditButtonWindow
	 */
	getButtonData: () => Promise<{
		parsedId: string;
		buttonData: SoundButtonData;
	}>;
	updateButtonData: (parsedId: string, buttonData: SoundButtonData) => Promise<void>;

	onAskCompareChanges: (callback: () => void) => void;
	sendCompareChanges: (parsedId: string, buttonData: SoundButtonData) => Promise<void>;
};
