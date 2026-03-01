const handler = require('../../../../main/discord/core/handler/handler.js');
const DisplayComponents = require('./DisplayComponents.js');
const AsciiMaker = require('./AsciiMaker.js');
const { MessageFlags } = require('discord.js');

/* eslint-disable no-unused-vars, no-constant-condition */
if (null) {
	const heartType = require('../../../../types/heart.js');
}
/* eslint-enable no-unused-vars, no-constant-condition  */

module.exports = class zdLibraryHandler extends handler {
	constructor(heart) {
		super(heart, 'zdlibrary');
		this.displayComponents = new DisplayComponents(heart);
		this.asciiMaker = new AsciiMaker(heart);
	}

	generateSuccessEmbed(message) {
		return this.heart.core.util.discord.generateEmbed(
			null,
			`${this.heart.core.discord.core.emoji.manager.getEmoji(28)} ${this.heart.core.discord.core.handler.manager.get('placeholder').resolve(message)}`,
			'2ECC71',
		);
	}

	resolveDisplayComponents(config, placeholders = {}, guild = null, user = null) {
		if (!config) return null;
		
		if (config.ComponentsV2) {
			const res = this.displayComponents.resolveDisplayComponents(config, placeholders, guild, user);
			return {
				components: res.components,
				flags: MessageFlags.IsComponentsV2
			};
		}

		return { 
			embeds: [this.heart.core.util.discord.resolveEmbed(config.ComponentsV1, placeholders, guild, user)] 
		};
	}

	buildContainerFromConfig(config, placeholders = {}, guild = null, user = null) {
		return this.displayComponents.buildContainerFromConfig(config, placeholders, guild, user);
	}

	generateAscii(text, font) {
		return this.asciiMaker.generate(text, font);
	}
};
