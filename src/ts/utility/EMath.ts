/**
 * Extended Math
 */
abstract class EMath {
	public static clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	public static clampMin(value: number, min: number) {
		return Math.max(value, min);
	}

	public static clampMax(value: number, max: number) {
		return Math.min(value, max);
	}

	/**
	 * Generates a random integer between `min` (inclusive) and `max` (exclusive).
	 * @param min - The minimum **inclusive** number
	 * @param max - The maximum **exclusive** number
	 * @returns The extracted integer
	 */
	public static randomInt(min: number = 0, max: number = 256): number {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min);
	}

	/**
	 * Converts an RGB color to HSL.
	 *
	 * @param r	The red value
	 * @param g	The green value
	 * @param b	The blue value
	 * @returns The HSL representation
	 */
	public static RGBToHSL(
		r: number,
		g: number,
		b: number
	): [number, number, number] {
		// Make r, g, and b fractions of 1
		r /= 255;
		g /= 255;
		b /= 255;

		// Find greatest and smallest channel values
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// Calculate hue
		// No difference
		if (delta == 0) h = 0;
		// Red is max
		else if (cmax == r) h = ((g - b) / delta) % 6;
		// Green is max
		else if (cmax == g) h = (b - r) / delta + 2;
		// Blue is max
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// Make negative hues positive behind 360°
		if (h < 0) h += 360; // Calculate lightness
		l = (cmax + cmin) / 2;

		// Calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// Multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return [h, s, l];
	}

	/**
	 * Converts an HSL color to RGB.
	 *
	 * @param h The hue value
	 * @param s The saturation value
	 * @param l The lightness value
	 * @returns The RGB representation
	 */
	public static HSLToRGB(
		h: number,
		s: number,
		l: number
	): [number, number, number] {
		// Must be fractions of 1
		s /= 100;
		l /= 100;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		return [r, g, b];
	}

	/**
	 * Returns a string representation of the RGB color (without hash symbol).
	 * @see {@link https://css-tricks.com/converting-color-spaces-in-javascript/}
	 */
	public static HexToRGB(hex: string): [number, number, number] {
		let r = "0",
			g = "0",
			b = "0";

		// 3 digits
		if (hex.length == 4) {
			r = "0x" + hex[1] + hex[1];
			g = "0x" + hex[2] + hex[2];
			b = "0x" + hex[3] + hex[3];
		}
		// 6 digits
		else if (hex.length == 7) {
			r = "0x" + hex[1] + hex[2];
			g = "0x" + hex[3] + hex[4];
			b = "0x" + hex[5] + hex[6];
		}

		return [+r, +g, +b];
	}

	public static componentToHex(c: number) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	public static getExponentialValue(
		initialValue: number,
		decimalPoints: number = 2,
		base: number = 50
	): number {
		// Return an exponential version of the value.
		// `parseFloat` is used because `toFixed` converts the number to a string.
		return parseFloat(
			((Math.pow(base, initialValue) - 1) / (base - 1)).toFixed(decimalPoints)
		);
	}

	/**
	 * Returns a logarithmic version of the given {@link position}.
	 * @see {@link https://stackoverflow.com/a/846249/16804863}
	 * @param position The position to scale logarithmically
	 * @param minPosition The minimum position
	 * @param maxPosition The maximum position
	 * @param minResult The minimum logarithmic result
	 * @param maxResult The maximum logarithmic result
	 * @returns The scaled value
	 */
	public static logarithmicValue(
		position: number,
		minPosition: number = 0,
		maxPosition: number = 100,
		minResult: number = 0,
		maxResult: number = 1
	): number {
		minResult = Math.log(minResult);
		maxResult = Math.log(maxResult);

		const scale = (maxResult - minResult) / (maxPosition - minPosition);

		return Math.exp(minResult + scale * (position - minPosition));
	}
}
