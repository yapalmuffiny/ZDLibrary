const handler = require('../../../../main/discord/core/handler/handler.js');
const DisplayComponents = require('./DisplayComponents.js');
const AsciiMaker = require('./AsciiMaker.js');
const { MessageFlags } = require('discord.js');

module.exports = class ZDLibraryHandler extends handler {
	constructor(heart) {
		super(heart, 'zdlibrary');
		this.displayComponents = new DisplayComponents(heart);
		this.asciiMaker = new AsciiMaker(heart);
	}

	resolveDisplayComponents(config, placeholders = {}, guild = null, user = null) {
		let payload = {};

		if (config.ComponentsV1) {
			payload.embeds = [this.heart.core.util.discord.resolveEmbed(config.ComponentsV1, placeholders, guild, user)];
		}

		if (config.ComponentsV2) {
			const resolved = this.displayComponents.resolveDisplayComponents(config, placeholders, guild, user);
			payload = { ...payload, components: resolved.components, flags: MessageFlags.IsComponentsV2 };
		}

		if (config.Ephemeral) {
			const currentFlags = payload.flags || 0;
			payload.flags = currentFlags | MessageFlags.Ephemeral;
		}

		return payload;
	}

	buildContainerFromConfig(config, placeholders = {}, guild = null, user = null) {
		return this.displayComponents.buildContainerFromConfig(config, placeholders, guild, user);
	}

	generateAscii(text, font) {
		return this.asciiMaker.generate(text, font);
	}
};