const plugin = require('../../main/discord/core/plugins/plugin.js');
const zdLibraryHandler = require('./src/handler/zdlibrary.js');

/* eslint-disable no-unused-vars, no-constant-condition */
if (null) {
	const heartType = require('../../types/heart.js');
	const pluginType = require('../../types/discord/core/plugins/plugin.js');
}
/* eslint-enable no-unused-vars, no-constant-condition  */

/**
 * Main class for the ZDLibrary plugin.
 * @class
 * @extends pluginType
 */
module.exports = class ZDLibrary extends plugin {
	/**
	 * Creates an instance of ZDLibrary.
	 * @param {heartType} heart - The heart of the bot.
	 */
	constructor(heart) {
		super(heart, {
			name: 'ZDLibrary',
			author: 'Zero Development',
			version: '1.0.0.0',
			priority: 25,
			dependencies: ['core', 'web_api'],
			softDependencies: [],
			nodeDependencies: [],
			channels: [],
			dashboard: { cannotDisable: false },
		});
	}

	/**
	 * Pre-loads the plugin by registering the handler.
	 */
	async preLoad() {
		this.heart.core.discord.core.handler.manager.register(
			new zdLibraryHandler(this.heart),
		);
	}

	/**
	 * Loads the plugin and displays the startup ASCII art and links.
	 */
	async load() {
		this.heart.core.console.log(this.heart.core.console.type.startup, '', this.heart.core.console.color.console.foreground.magenta);
		this.heart.core.discord.core.handler.manager.get('zdlibrary').generateAscii(this.getName()).split('\n').forEach(l => this.heart.core.console.log(this.heart.core.console.type.startup, l, this.heart.core.console.color.console.foreground.yellow));
		this.heart.core.console.log(this.heart.core.console.type.startup, '', this.heart.core.console.color.console.foreground.magenta);
		this.heart.core.console.log(this.heart.core.console.type.startup, 'Discord: https://discord.gg/zerodev', this.heart.core.console.color.console.foreground.magenta);
		this.heart.core.console.log(this.heart.core.console.type.startup, 'BuiltByBit: https://builtbybit.com/zerodev', this.heart.core.console.color.console.foreground.magenta);
		this.heart.core.console.log(this.heart.core.console.type.startup, 'Zero Shop: https://zerodev.ca', this.heart.core.console.color.console.foreground.magenta);
		this.heart.core.console.log(this.heart.core.console.type.startup, '', this.heart.core.console.color.console.foreground.magenta);
	}
};
