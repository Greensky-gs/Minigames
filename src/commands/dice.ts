import { AmethystCommand } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';

export default new AmethystCommand({
    name: 'dés',
    description: 'Lance des dés',
    options: [
        {
            name: 'dés',
            description: 'Nombre de dés',
            type: ApplicationCommandOptionType.Integer,
            maxValue: 10,
            minValue: 1,
            required: false
        },
        {
            name: 'faces',
            description: 'Nombre de face des dés',
            type: ApplicationCommandOptionType.Integer,
            maxValue: 120,
            minValue: 2,
            required: false
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    const dices = options.getInteger('dés') ?? 2;
    const faces = options.getInteger('faces') ?? 6;

    const results = new Array(dices).fill(0).map(() => Math.floor(Math.random() * faces - 1) + 1);

    interaction
        .reply({
            content: `🎲 __**Lancé de dés**__\n\n${results
                .map((d, i) => `Dé n°${i + 1} : **${d}**`)
                .join('\n')}\nTotal : \`${results.reduce((a, b) => a + b)}\``
        })
        .catch(() => {});
});
