const fs = require('fs');
const path = require('path');

module.exports = class AsciiMaker {
	constructor(heart) {
		this.heart = heart;
		this.fontsPath = path.join(__dirname, '../../data/fonts');
		this.loadedFonts = new Map();
		this.defaultFont = 'ANSI Shadow';
	}

	loadFont(fontName) {
		if (this.loadedFonts.has(fontName)) return this.loadedFonts.get(fontName);
		const data = JSON.parse(fs.readFileSync(path.join(this.fontsPath, `${fontName}.json`), 'utf8'));
		this.loadedFonts.set(fontName, data);
		return data;
	}

	generate(text, fontName = this.defaultFont) {
		const font = this.loadFont(fontName);
		const lines = Array(font.height).fill('');

		for (const char of text.toUpperCase()) {
			const charData = font.characters[char];
			if (!charData) continue;
			for (let i = 0; i < font.height; i++) {
				lines[i] += charData[i] ?? '';
			}
		}

		return lines.join('\n');
	}
};