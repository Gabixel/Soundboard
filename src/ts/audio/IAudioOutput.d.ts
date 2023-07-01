interface IAudioOutput {
	connectNode(node: AudioNode): void;
	disconnectNode(node: AudioNode): void;
	sinkId: string;
	setSinkId(sinkId: string): Promise<void>;

	/**
	 * Creates one of the possible available {@link AudioEffect}s.
	 * @param effect The desired effect node to generate
	 * @returns The generated effect node (as an {@link AudioNode})
	 */
	generateEffect<T>(effect: AudioEffect): T;

	/**
	 * Creates the souce node for a {@link HTMLMediaElement}.
	 * @param element The original element of the generated source node
	 */
	createMediaElementSource(
		element: HTMLMediaElement
	): MediaElementAudioSourceNode;
}
