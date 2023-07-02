/**
 * Centralized audio effects generation and output.
 */
class AudioOutput extends Logger implements IAudioOutput {
	/**
	 * The audio output.
	 */
	private _context: AudioContext;

	private static effectMap: Record<AudioEffect, any> = {
		GainNode,
		BiquadFilterNode,
	};

	constructor(sinkId?: string) {
		super();

		this._context = new AudioContext({
			latencyHint: "interactive", // This option indicates that low audio processing latency is important, such as for real-time interactive applications like games or music applications where immediate audio response is critical
		});

		if(sinkId) {
			this.setSinkId(sinkId);
		}
	}

	public connectNode(node: AudioNode): void {
		node.connect(this._context.destination);
	}

	public get sinkId(): string {
		return this._context.sinkId;
	}

	public async setSinkId(sinkId: string): Promise<void> {
		await this._context.setSinkId(sinkId);
	}

	public generateEffect<T>(effect: AudioEffect): T {
		return new AudioOutput.effectMap[effect](this._context);
	}

	public createMediaElementSource(
		element: HTMLMediaElement
	): MediaElementAudioSourceNode {
		return this._context.createMediaElementSource(element);
	}
}
