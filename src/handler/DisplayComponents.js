const { ContainerBuilder, ThumbnailBuilder, ButtonBuilder, ButtonStyle } = require('@discordjs/builders');

/* eslint-disable no-unused-vars, no-constant-condition */
if (null) {
	const heartType = require('../../../../types/heart.js');
}
/* eslint-enable no-unused-vars, no-constant-condition  */

module.exports = class DisplayComponents {
	constructor(heart) {
		this.heart = heart;
	}

	resolveDisplayComponents(componentConfig, placeholders = {}, guild = null, user = null) {
		const allPlaceholders = this.buildPlaceholders(placeholders, guild, user);
		const containers = componentConfig.ComponentsV2.Components.filter(c => c.Type.toLowerCase() === 'container');
		const components = containers.map((c, i) => this.buildContainer(c, i, allPlaceholders).toJSON());
		return { components };
	}

	buildPlaceholders(custom = {}, guild = null, user = null) {
		const placeholders = { ...custom };
		const now = new Date();

		if (user) {
			Object.assign(placeholders, {
				userName: user.username,
				user: user.username,
				userDisplay: user.displayName,
				userId: user.id,
				userMention: `<@${user.id}>`,
				userAvatar: user.displayAvatarURL({ dynamic: true, size: 256 }),
				userCreated: user.createdAt.toLocaleDateString()
			});
		}

		if (guild) {
			Object.assign(placeholders, {
				guildName: guild.name,
				guild: guild.name,
				guildId: guild.id,
				guildIcon: guild.iconURL({ dynamic: true, size: 256 }),
				memberCount: guild.memberCount,
				memberCountNumeric: guild.memberCount
			});
		}

		Object.assign(placeholders, {
			currentDate: now.toLocaleDateString(),
			currentTime: now.toLocaleTimeString(),
			currentDatetime: now.toLocaleString()
		});

		return placeholders;
	}

	replacePlaceholders(text, placeholders) {
		return this.heart.core.util.discord.resolvePlaceholder(text, placeholders);
	}

	buildContainer(config, index, placeholders = {}) {
		const builder = new ContainerBuilder();
		const color = this.parseColor(this.replacePlaceholders(config.AccentColor, placeholders));

		builder.setAccentColor(color);
		if (config.Spoiler) builder.setSpoiler(true);

		if (config.Components && Array.isArray(config.Components)) {
			config.Components.forEach((c, i) => this.addComponentToContainer(builder, c, i, placeholders));
		}

		return builder;
	}

	addComponentToContainer(builder, component, index, placeholders = {}) {
		if (!component || !component.Type) return;
		const type = component.Type.toLowerCase();

		if (type === 'section' && !component.Accessory) {
			if (component.Text) this._addTextDisplay(builder, { Content: component.Text.Content }, placeholders);
			return;
		}

		switch (type) {
			case 'section': this._addSection(builder, component, placeholders); break;
			case 'text_display': this._addTextDisplay(builder, component, placeholders); break;
			case 'separator': this._addSeparator(builder, component); break;
			case 'file': this._addFile(builder, component, placeholders); break;
		}
	}

	_addSection(builder, component, placeholders) {
		builder.addSectionComponents((section) => {
			section.addTextDisplayComponents((t) => {
				t.setContent(String(this.replacePlaceholders(component.Text.Content, placeholders)));
				return t;
			});

			if (component.Accessory && component.Accessory.Type) {
				const accType = component.Accessory.Type.toLowerCase();

				if (accType === 'thumbnail' && component.Accessory.Media) {
					section.setThumbnailAccessory((t) => {
						t.setURL(String(this.replacePlaceholders(component.Accessory.Media.URL, placeholders)));
						return t;
					});
				}

				if (accType === 'button') {
					section.setButtonAccessory((button) => {
						const acc = component.Accessory;

						button.setLabel(String(this.replacePlaceholders(acc.Label, placeholders)));
						
						const url = acc.URL || acc.Url;
						if (url) {
							button.setStyle(ButtonStyle.Link);
							button.setURL(String(this.replacePlaceholders(url, placeholders)));
						} else {
							this.heart.core.util.discord.convertButtonColor(button, (acc.Style || 'primary').toLowerCase());
							if (acc.CustomId) button.setCustomId(String(this.replacePlaceholders(acc.CustomId, placeholders)));
						}

						if (acc.Emoji) {
							const emoji = this.parseEmoji(this.replacePlaceholders(acc.Emoji, placeholders));
							if (emoji) button.setEmoji(emoji);
						}

						if (acc.Disabled) button.setDisabled(true);
						return button;
					});
				}
			}

			return section;
		});
	}

	_addTextDisplay(builder, component, placeholders) {
		if (!component || !component.Content) return;
		builder.addTextDisplayComponents((t) => {
			t.setContent(String(this.replacePlaceholders(component.Content, placeholders)));
			return t;
		});
	}

	_addSeparator(builder, component) {
		builder.addSeparatorComponents((s) => {
			s.setDivider(!!component.Divider);
			if (component.Spacing) {
				const spacingMap = { small: 1, large: 2 };
				s.setSpacing(spacingMap[component.Spacing.toLowerCase()]);
			}
			return s;
		});
	}

	_addFile(builder, component, placeholders) {
		builder.addFileComponents((f) => {
			const url = component.URL ? component.URL : component.Url;
			f.setURL(String(this.replacePlaceholders(url, placeholders)));
			if (component.Spoiler) f.setSpoiler(true);
			return f;
		});
	}

	parseColor(color) {
		if (!color) return 0;
		const res = this.heart.core.util.discord.resolveColors(String(color));
		if (!res) return 0;
		return parseInt(res.replace('#', ''), 16);
	}

	parseEmoji(emoji) {
		if (!emoji) return null;
		if (typeof emoji === 'object' && (emoji.id || emoji.name)) return emoji;
		const str = String(emoji);
		const match = str.match(/<a?:([^:]+):(\d+)>/);
		if (match) return { id: match[2] };
		if (/^\d+$/.test(str)) return { id: str };
		if (/\p{Emoji}/u.test(str)) return str;
		return null;
	}

	buildContainerFromConfig(config, placeholders = {}, guild = null, user = null) {
		const all = this.buildPlaceholders(placeholders, guild, user);
		const container = config.ComponentsV2.Components.find(c => c.Type.toLowerCase() === 'container');
		if (!container) return null;
		return this.buildContainer(container, 0, all);
	}
};
