interface IAudioOutput {
	connectNode(node: AudioNode): void;
	disconnectNode(node: AudioNode): void;
	sinkId: string;
	setSinkId(sinkId: string): void;
	
	/**
	 * Creates one of the possible provided {@link AudioEffect}s.
	 * @param effect The desired effect node to generate
	 * @returns The generated effect node (as an {@link AudioNode})
	 */
	generateEffect(effect: AudioEffect): AudioNode;
}
