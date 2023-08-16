interface ISoundButtonIdGenerator {
	parseSoundButtonId(buttonId: number): string;
	getCompositeSoundButtonId(parsedButtonId: string): object & {
		buttonId: number;
	};
}
