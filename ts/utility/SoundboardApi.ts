class SoundboardApi {
	public static openContextMenu(args: any = null): void {
		// @ts-ignore
		window.api.openContextMenu(args);
	}

	public static get isProduction(): boolean {
		// @ts-ignore
		return window.api.isProduction;
	}
}
