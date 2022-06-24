class SoundboardApi extends LogExtend {
	public static openContextMenu(args: any = null): void {
		this.log(this.openContextMenu, "Opening context menu with args:", args);

		// @ts-ignore
		window.api.openContextMenu(args);
	}

	public static get isProduction(): boolean {
		// @ts-ignore
		return window.api.isProduction;
	}
}
