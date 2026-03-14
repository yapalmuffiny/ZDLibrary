const { ContainerBuilder, ButtonStyle } = require('@discordjs/builders');

module.exports = class DisplayComponents {
  constructor(heart) {
    this.heart = heart;
  }

  resolveDisplayComponents(componentConfig, placeholders = {}, guild = null, user = null) {
    const allPlaceholders = this.buildPlaceholders(placeholders, guild, user);
    const components = componentConfig.ComponentsV2.Components
      .filter(c => c.Type.toLowerCase() === 'container')
      .map((c, i) => this.buildContainer(c, i, allPlaceholders).toJSON());
    return { components };
  }

  buildPlaceholders(custom = {}, guild = null, user = null) {
    const now = new Date();
    const result = { ...custom };

    if (user) {
      Object.assign(result, {
        user: user.username,
        userName: user.username,
        userDisplay: user.displayName,
        userId: user.id,
        userMention: `<@${user.id}>`,
        userAvatar: user.displayAvatarURL({ dynamic: true, size: 256 }),
        userCreated: user.createdAt.toLocaleDateString(),
      });
    }

    if (guild) {
      Object.assign(result, {
        guild: guild.name,
        guildName: guild.name,
        guildId: guild.id,
        guildIcon: guild.iconURL({ dynamic: true, size: 256 }),
        memberCount: guild.memberCount,
        memberCountNumeric: guild.memberCount,
      });
    }

    Object.assign(result, {
      currentDate: now.toLocaleDateString(),
      currentTime: now.toLocaleTimeString(),
      currentDatetime: now.toLocaleString(),
    });

    return result;
  }

  fill(text, placeholders) {
    return this.heart.core.util.discord.resolvePlaceholder(text, placeholders);
  }

  buildContainer(config, index, placeholders = {}) {
    const builder = new ContainerBuilder();
    const color = this.parseColor(this.fill(config.AccentColor, placeholders));

    builder.setAccentColor(color);
    if (config.Spoiler) builder.setSpoiler(true);

    for (const component of config.Components ?? []) {
      this.addComponent(builder, component, placeholders);
    }

    return builder;
  }

  addComponent(builder, component, placeholders = {}) {
    if (!component?.Type) return;

    const type = component.Type.toLowerCase();
    if (type === 'section' && !component.Accessory) {
      if (component.Text) this.addTextDisplay(builder, { Content: component.Text.Content }, placeholders);
      return;
    }

    switch (type) {
      case 'section':      return this.addSection(builder, component, placeholders);
      case 'text_display': return this.addTextDisplay(builder, component, placeholders);
      case 'separator':    return this.addSeparator(builder, component);
      case 'file':         return this.addFile(builder, component, placeholders);
    }
  }

  addSection(builder, component, placeholders) {
    builder.addSectionComponents(section => {
      section.addTextDisplayComponents(t => {
        t.setContent(String(this.fill(component.Text.Content, placeholders)));
        return t;
      });

      const acc = component.Accessory;
      if (!acc?.Type) return section;

      const accType = acc.Type.toLowerCase();

      if (accType === 'thumbnail' && acc.Media) {
        section.setThumbnailAccessory(t => {
          t.setURL(String(this.fill(acc.Media.URL, placeholders)));
          return t;
        });
      }

      if (accType === 'button') {
        section.setButtonAccessory(button => {
          button.setLabel(String(this.fill(acc.Label, placeholders)));

          const url = acc.URL ?? acc.Url;
          if (url) {
            button.setStyle(ButtonStyle.Link);
            button.setURL(String(this.fill(url, placeholders)));
          } else {
            this.heart.core.util.discord.convertButtonColor(button, (acc.Style ?? 'primary').toLowerCase());
            if (acc.CustomId) button.setCustomId(String(this.fill(acc.CustomId, placeholders)));
          }

          if (acc.Emoji) {
            const emoji = this.parseEmoji(this.fill(acc.Emoji, placeholders));
            if (emoji) button.setEmoji(emoji);
          }

          if (acc.Disabled) button.setDisabled(true);
          return button;
        });
      }

      return section;
    });
  }

  addTextDisplay(builder, component, placeholders) {
    if (!component?.Content) return;
    builder.addTextDisplayComponents(t => {
      t.setContent(String(this.fill(component.Content, placeholders)));
      return t;
    });
  }

  addSeparator(builder, component) {
    const spacingMap = { small: 1, large: 2 };
    builder.addSeparatorComponents(s => {
      s.setDivider(!!component.Divider);
      if (component.Spacing) s.setSpacing(spacingMap[component.Spacing.toLowerCase()]);
      return s;
    });
  }

  addFile(builder, component, placeholders) {
    const url = component.URL ?? component.Url;
    builder.addFileComponents(f => {
      f.setURL(String(this.fill(url, placeholders)));
      if (component.Spoiler) f.setSpoiler(true);
      return f;
    });
  }

  parseColor(color) {
    if (!color) return 0;
    const hex = this.heart.core.util.discord.resolveColors(String(color));
    return hex ? parseInt(hex.replace('#', ''), 16) : 0;
  }

  parseEmoji(emoji) {
    if (!emoji) return null;
    if (typeof emoji === 'object' && (emoji.id || emoji.name)) return emoji;

    const str = String(emoji);
    const custom = str.match(/<a?:[^:]+:(\d+)>/);
    if (custom) return { id: custom[1] };
    if (/^\d+$/.test(str)) return { id: str };
    if (/\p{Emoji}/u.test(str)) return str;

    return null;
  }

  buildContainerFromConfig(config, placeholders = {}, guild = null, user = null) {
    const all = this.buildPlaceholders(placeholders, guild, user);
    const container = config.ComponentsV2.Components.find(c => c.Type.toLowerCase() === 'container');
    return container ? this.buildContainer(container, 0, all) : null;
  }
};