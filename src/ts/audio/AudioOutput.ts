/**
 * Centralized audio effects generation and output.
 */
class AudioOutput implements IAudioOutput {
	/**
	 * The audio output.
	 */
	private _context: AudioContext;

	private _masterVolume: GainNode;

	/**
	 * Available effects for the user.
	 */
	private static EFFECT_MAP: Record<AudioEffect, any> = {
		GainNode,
		BiquadFilterNode,
	};

	constructor(sinkId?: string) {
		this._context = new AudioContext({
			latencyHint: "interactive", // This option indicates that low audio processing latency is important, such as for real-time interactive applications like games or music applications where immediate audio response is critical
		});

		if (sinkId) {
			this.setSinkId(sinkId);
		}

		this._masterVolume = this._context.createGain();
		this._masterVolume.connect(this._context.destination);
	}

	public get sinkId(): string {
		return this._context.sinkId;
	}

	public async setSinkId(sinkId: string): Promise<void> {
		await this._context.setSinkId(sinkId);
	}

	public connectNode(node: AudioNode): void {
		node.connect(this._masterVolume);
	}

	public createEffect<T>(effect: AudioEffect): T | never {
		// Check if the effect is actually in the allowed list
		for (const effectKey in AudioOutput.EFFECT_MAP) {
			if (effectKey !== effect) {
				continue;
			}

			return new AudioOutput.EFFECT_MAP[effect](this._context);
		}

		throw new RangeError(
			`The "${effect}" effect doest not exist or is not supported.`
		);
	}

	public createMediaElementSource(
		element: HTMLMediaElement
	): MediaElementAudioSourceNode {
		return this._context.createMediaElementSource(element);
	}

	public setVolume(newVolume: number): void {
		this._masterVolume.gain.value = newVolume;
	}
}
