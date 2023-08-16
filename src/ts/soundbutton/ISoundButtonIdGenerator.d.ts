interface ISoundButtonIdGenerator {
	parseSoundButtonId(buttonId: number, collectionId: number): string;
	getCompositeSoundButtonId(parsedButtonId: string): object & {
		buttonId: number;
	};
}
