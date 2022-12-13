abstract class SoundboardApi {
	public static openContextMenu(args: any = null): void {
		Logger.logInfo(
			this.name,
			this.openContextMenu,
			"Opening context menu with args:",
			args
		);

		// @ts-ignore
		window.api.openContextMenu(args);
	}

	public static get isProduction(): boolean {
		// @ts-ignore
		return window.api.isProduction;
	}
}
