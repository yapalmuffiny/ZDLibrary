const fs = require('fs');
const path = require('path');

/* eslint-disable no-unused-vars, no-constant-condition */
if (null) {
	const heartType = require('../../../../types/heart.js');
}
/* eslint-enable no-unused-vars, no-constant-condition  */

/**
 * Utility class for generating ASCII art from text using custom fonts.
 * @class
 */
module.exports = class AsciiMaker {
	/**
	 * Creates an instance of AsciiMaker.
	 * @param {heartType} heart - The heart of the bot.
	 */
	constructor(heart) {
		this.heart = heart;
		this.fontsPath = path.join(__dirname, '../../data/fonts');
		this.loadedFonts = new Map();
		this.defaultFont = 'ANSI Shadow';
	}

	/**
	 * Loads a font from the data directory.
	 * @param {string} fontName - The name of the font to load.
	 * @returns {Object} The font data.
	 */
	loadFont(fontName) {
		if (this.loadedFonts.has(fontName)) return this.loadedFonts.get(fontName);
		const fontData = JSON.parse(fs.readFileSync(path.join(this.fontsPath, `${fontName}.json`), 'utf8'));
		this.loadedFonts.set(fontName, fontData);
		return fontData;
	}

	/**
	 * Generates ASCII art for the given text.
	 * @param {string} text - The text to convert.
	 * @param {string} [fontName='ANSI Shadow'] - The font to use.
	 * @returns {string} The generated ASCII art.
	 */
	generate(text, fontName = 'ANSI Shadow') {
		const targetFont = fontName;
		const font = this.loadFont(targetFont);

		const lines = Array(font.height).fill('');
		const chars = text.toUpperCase().split('');

		for (const char of chars) {
			const charData = font.characters[char];
			for (let i = 0; i < font.height; i++) {
				lines[i] += charData[i];
			}
		}

		return lines.join('\n');
	}
};
