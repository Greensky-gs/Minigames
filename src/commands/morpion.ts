import { AmethystCommand, waitForInteraction } from 'amethystjs';
import { ApplicationCommandOptionType, ComponentType, Message } from 'discord.js';
import { basicEmbed, canceled, noBtn, row, yesBtn } from '../utils/toolbox';
import { Morpion } from '../games/Morpion';

export default new AmethystCommand({
    name: 'morpion',
    description: 'Joue au morpion',
    options: [
        {
            name: 'utilisateur',
            description: 'Utilisateur avec lequel vous voulez jouer',
            required: true,
            type: ApplicationCommandOptionType.User
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    const user = options.getUser('utilisateur');
    if (user.bot)
        return interaction
            .reply({
                content: 'Vous ne pouvez pas jouer contre un bot',
                ephemeral: true
            })
            .catch(() => {});
    if (user.id === interaction.user.id)
        return interaction
            .reply({
                content: 'Vous ne pouvez pas jouer contre vous-même',
                ephemeral: true
            })
            .catch(() => {});

    const msg = (await interaction
        .reply({
            embeds: [
                basicEmbed(user)
                    .setTitle('Morpion')
                    .setDescription(
                        `<@${interaction.user.id}> vous défie dans une partie de morpion sans merci, relevez-vous le défi ?`
                    )
                    .setColor('Orange')
            ],
            content: `<@${user.id}>`,
            components: [row(yesBtn(), noBtn())],
            fetchReply: true
        })
        .catch(() => {})) as Message<true>;
    if (!msg) return;

    const confirmation = await waitForInteraction({
        componentType: ComponentType.Button,
        user,
        message: msg
    }).catch(() => {});

    if (!confirmation || confirmation.customId === 'no')
        return interaction
            .editReply({
                embeds: [canceled()],
                components: []
            })
            .catch(() => {});
    await confirmation.deferUpdate().catch(() => {});
    const morpion = new Morpion({
        users: [user, interaction.user],
        interaction
    });
});
