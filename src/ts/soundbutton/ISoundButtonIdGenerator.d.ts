interface ISoundButtonIdGenerator {
	parseSoundButtonId(buttonId: number, collectionId: number): string;
	getCompositeSoundButtonId(parsedButtonId: string): {
		buttonId: number;
		collectionId: number
	};
}
