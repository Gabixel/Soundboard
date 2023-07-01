/**
 * Centralized audio effects generation and output.
 */
class AudioOutput extends Logger implements IAudioOutput {
	/**
	 * The audio output
	 */
	private _context: AudioContext;

	private m = new Map<AudioEffect, () => AudioNode>([
		[AudioEffect.gain, () => this._context.createGain()],
	]);

	constructor() {
		super();

		this._context = new AudioContext();
	}

	public connectNode(node: AudioNode): void {
		node.connect(this._context.destination);
	}

	public disconnectNode(node: AudioNode): void {
		node.disconnect(this._context.destination);
	}

	public get sinkId(): string {
		return this._context.sinkId;
	}

	public setSinkId(sinkId: string): void {
		this._context.setSinkId(sinkId);
	}

	public generateEffect(effect: AudioEffect): AudioNode {
		return this.m.get(effect)();
	}
}