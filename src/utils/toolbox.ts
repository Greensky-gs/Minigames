import { ActionRowBuilder, AnyComponentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, User } from 'discord.js';

export const button = (data: {
    style: keyof typeof ButtonStyle;
    emoji?: string;
    label?: string;
    id?: string;
    url?: string;
    disabled?: boolean;
}) => {
    const btn = new ButtonBuilder().setStyle(ButtonStyle[data.style]);

    if (data.label) btn.setLabel(data.label);
    if (data.disabled != undefined) btn.setDisabled(data.disabled);
    if (data.emoji) btn.setEmoji(data.emoji);
    if (data.id) btn.setCustomId(data.id);
    if (data.url) btn.setURL(data.url);

    return btn;
};
export const row = <T extends AnyComponentBuilder = ButtonBuilder>(...components: T[]): ActionRowBuilder<T> => {
    return new ActionRowBuilder({
        components: components
    }) as ActionRowBuilder<T>;
};
export const yesBtn = () => {
    return button({
        label: 'Oui',
        style: 'Success',
        id: 'yes'
    });
};
export const noBtn = () => {
    return button({
        label: 'Non',
        id: 'no',
        style: 'Danger'
    });
};
export const basicEmbed = (user: User) => {
    return new EmbedBuilder()
        .setTimestamp()
        .setFooter({ text: user.username, iconURL: user.displayAvatarURL({ forceStatic: false }) });
};
export const random = ({ max = 100, min = 0 }: { max?: number; min?: number }) => {
    let data = {
        max,
        min
    };
    if (data.max < data.min) {
        data = {
            max: data.min,
            min: data.max
        };
    }

    return Math.floor(Math.random() * data.max - data.min) + data.min;
};
export const canceled = () => {
    return new EmbedBuilder().setTitle('💡 Annulé').setColor('Yellow');
};
export const resize = (str: string, length?: number) => {
    const max = length ?? 100;
    if (str.length <= max) return str;
    return str.slice(0, max - 3) + '...';
};
