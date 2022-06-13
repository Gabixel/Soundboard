class EMath {
	public static clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	/**
	 * Generates a random integer between `min` (inclusive) and `max` (exclusive).
	 * @param min - The minimum inclusive number
	 * @param max - The maximum exclusive number
	 * @returns The random integer
	 */
	public static randomInt(min: number = 0, max: number = 256): number {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
	}

	/**
	 * Converts an RGB color value to HSL.
	 *
	 * @param r	The red color value
	 * @param g	The green color value
	 * @param b	The blue color value
	 * @returns The HSL representation
	 */
	public static rgbToHsl(r: number, g: number, b: number): number[] {
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
	 * Converts an HSL color value to RGB.
	 *
	 * @param h The hue
	 * @param s The saturation
	 * @param l The lightness
	 * @returns The RGB representation
	 */
	public static hslToRgb(h: number, s: number, l: number): number[] {
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

	public static getEponentialValue(
		initialValue: number,
		base: number = 50
	): number {
		// Return an exponential version of the value
		return parseFloat(
			((Math.pow(base, initialValue) - 1) / (base - 1)).toFixed(2)
		);
	}

	public static logarithmicValue(
		pos: number,
		minPos: number = 0,
		maxPos: number = 100,
		minRes: number = 0,
		maxRes: number = 1
	): number {
		// Return a logarithmic version of the value (https://stackoverflow.com/questions/846221/logarithmic-slider)

		minRes = Math.log(minRes);
		maxRes = Math.log(maxRes);

		const scale = (maxRes - minRes) / (maxPos - minPos);

		return Math.exp(minRes + scale * (pos - minPos));
		// return (Math.log(pos) - minRes) / scale + maxPos;

		// return (
		// 	(Math.log(maxRes - minRes) / Math.log(maxPos - minPos)) * (pos - minPos) +
		// 	minRes
		// );
	}
}
