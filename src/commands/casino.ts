import { AmethystCommand } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';

export default new AmethystCommand({
    name: 'casino',
    description: 'Joue au casino',
    options: [
        {
            name: 'mise',
            description: 'Somme que vous souhaitez miser',
            type: ApplicationCommandOptionType.Integer,
            minValue: 1,
            required: true
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    const mise = options.getInteger('mise');
    const signs = [
        { emoji: '🍊', times: 1.5 },
        { emoji: '🍓', times: 1.6 },
        { emoji: '🍀', times: 2 },
        { emoji: '💎', times: 3 },
        { emoji: '🍒', times: 1.5 },
        { emoji: '🔔', times: 1.4 },
        { emoji: '🍎', times: 1.6 },
        { emoji: '<:casino_seven:1088889263875162122>', times: 7 },
        { emoji: '🎈', times: 1.2 },
        { emoji: '✨', times: 2.3 },
        { emoji: '🎀', times: 2 }
    ];

    const generateDisplay = () => {
        const random = () => {
            return signs[Math.floor(Math.random() * signs.length)];
        };
        const displays = new Array(9).fill(0).map(random);
        return {
            raw: displays,
            text: `${displays[0].emoji} | ${displays[1].emoji} | ${displays[2].emoji}\n\n${displays[3].emoji} | ${displays[4].emoji} | ${displays[5].emoji} <\n\n${displays[6].emoji} | ${displays[7].emoji} | ${displays[8].emoji}`
        };
    };

    await interaction
        .reply({
            content: `🎰 __**Casino**__\n\n${generateDisplay().text}`
        })
        .catch(() => {});

    let lastGenerated;
    const interval = setInterval(() => {
        const generated = generateDisplay();
        lastGenerated = generated;

        interaction
            .editReply({
                content: `🎰 __**Casino**__\n\n${generated.text}`
            })
            .catch(() => {});
    }, 1000);

    setTimeout(() => {
        clearInterval(interval);

        const msg =
            (lastGenerated.raw[3].emoji === lastGenerated.raw[4].emoji) === lastGenerated.raw[5].emoji
                ? `💲 Vous avez gagné **${mise * signs.find((x) => x.emoji === lastGenerated.raw[3].emoji).times}** 🪙`
                : `Vous avez perdu **${mise}** 🪙`;
        interaction
            .editReply({
                content: `🎰 __**Casino**__\n\n${lastGenerated.text}\n${msg}`
            })
            .catch(() => {});
    }, 3000);
});
