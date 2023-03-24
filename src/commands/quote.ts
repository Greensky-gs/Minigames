import { AmethystCommand, waitForInteraction, waitForMessage } from 'amethystjs';
import {
    ApplicationCommandOptionType,
    ComponentType,
    Message,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
    User
} from 'discord.js';
import { basicEmbed, button, canceled, resize, row } from '../utils/toolbox';

export default new AmethystCommand({
    name: 'quote',
    description: "Joue au quote à combien avec quelqu'un",
    options: [
        {
            name: 'combat',
            description: 'Ce que vous voulez parier',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'adversaire',
            description: 'Choisissez votre adversaire',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    const user = options.getUser('adversaire');
    if (user.id === interaction.user.id)
        return interaction.reply({
            content: "Vous n'allez pas jouer contre vous même",
            ephemeral: true
        });
    if (user.bot)
        return interaction.reply({
            content: 'Vous ne pouvez pas jouer contre un bot',
            ephemeral: true
        });
    const data = {
        max: 10,
        mised: options.getString('combat'),
        first: -1,
        second: -1
    };
    if (user.id !== interaction.client.user.id) {
        await interaction
            .reply({
                content: `<@${user.id}>`,
                embeds: [
                    basicEmbed(user)
                        .setTitle('Quote à combien')
                        .setDescription(
                            `<@${interaction.user.id}> vous défie pour un quote à combien\n> Quote à combien : ${data.mised} ?\n\n*répondez dans le chat par \`cancel\` pour annuler, ou par un nombre pour lancer le jeu*`
                        )
                        .setColor('Orange')
                ]
            })
            .catch(() => {});
        const userReply = await waitForMessage({
            channel: interaction.channel as TextChannel,
            user
        }).catch(() => {});
        if (!userReply || userReply.content?.toLowerCase() === 'cancel') {
            interaction
                .editReply({
                    embeds: [canceled()]
                })
                .catch(() => {});
            if (userReply) userReply.delete().catch(() => {});
            return;
        }

        if (isNaN(parseInt(userReply.content)))
            return interaction
                .editReply({
                    embeds: [],
                    content: `Ce n'est pas un nombre valide`
                })
                .catch(() => {});
        data.max = Math.abs(parseInt(userReply.content));

        userReply.delete().catch(() => {});
    }
    const msg = (await interaction[interaction.replied ? 'editReply' : 'reply']({
        embeds: [
            basicEmbed(interaction.user)
                .setTitle('Quote à combien')
                .setDescription(`<@${user.id}> a choisit **${data.max}** !\nChoisissez vos numéro`)
                .setColor('Orange')
        ],
        components: [
            row(
                button({
                    label: resize(interaction.user.username, 20),
                    style: 'Primary',
                    id: 'first'
                }),
                button({
                    label: resize(user.username, 20),
                    style: 'Secondary',
                    id: 'second'
                })
            )
        ],
        fetchReply: true
    }).catch(() => {})) as Message<true>;
    if (!msg) return;

    const askNumber = async (target: User): Promise<'noSelection' | number> => {
        return new Promise(async (resolve) => {
            await msg
                .edit({
                    content: `<@${target.id}> Choisissez votre numéro en appuyant sur le bouton`,
                    components: [row(button({ style: 'Primary', id: 'select', label: 'Choisir' }))],
                    embeds: []
                })
                .catch(() => {});

            const collector = msg.createMessageComponentCollector({
                time: 120000
            });

            collector.on('collect', async (ctx) => {
                if (ctx.user.id !== target.id) {
                    ctx.reply({
                        ephemeral: true,
                        content: 'Vous ne pouvez pas interagir avec ce message'
                    }).catch(() => {});
                    return;
                }

                await ctx
                    .showModal(
                        new ModalBuilder()
                            .setTitle('Quote à combien')
                            .setCustomId('selector')
                            .setComponents(
                                row(
                                    new TextInputBuilder()
                                        .setLabel('Numéro')
                                        .setPlaceholder(`Choisissez votre numéro entre 1 et ${data.max}`)
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                        .setMaxLength(data.max.toString().length)
                                        .setCustomId('selection')
                                )
                            )
                    )
                    .catch(() => {});
                const modal = await ctx
                    .awaitModalSubmit({
                        time: 60000
                    })
                    .catch(() => {});
                if (!modal) return;

                const number = parseInt(modal.fields.getTextInputValue('selection'));
                if (isNaN(number) || number < 1 || number > data.max) {
                    modal
                        .reply({
                            content: `Vous devez choisir un nombre valide compris entre **1** et **${data.max}**`,
                            ephemeral: true
                        })
                        .catch(() => {});
                    return;
                }
                await modal.deferUpdate().catch(() => {});
                resolve(number);
                collector.stop('collected');
            });
            collector.on('end', (c, reason) => {
                if (reason !== 'collected') return resolve('noSelection');
            });
        });
    };
    const first = await askNumber(interaction.user);
    if (!first || first === 'noSelection')
        return interaction
            .editReply({
                content: 'Annulé',
                components: [],
                embeds: []
            })
            .catch(() => {});

    const second = await askNumber(user);
    if (!second || second === 'noSelection')
        return interaction
            .editReply({
                content: 'Annulé',
                components: [],
                embeds: []
            })
            .catch(() => {});

    data.first = first;
    data.second = second;

    let countdown = 4;
    const interval = setInterval(() => {
        countdown--;
        msg.edit({
            content: `${countdown}...`,
            components: []
        }).catch(() => {});
    }, 1000);

    setTimeout(async () => {
        clearInterval(interval);
        const components = [];

        if (data.first !== data.second) {
            components.push(
                row(
                    button({
                        style: 'Primary',
                        emoji: '🔁',
                        label: 'Reverse',
                        id: 'reverse'
                    })
                )
            );
        }
        if (data.first === data.second) {
            await msg
                .edit({
                    content: `<@${interaction.user.id}> : **${data.first}**\n<@${user.id}> : **${data.second}**\nVous avez choisit le même numéro ! <@${user.id}>, vous avez perdu **${data.mised}**`,
                    embeds: [],
                    components: []
                })
                .catch(() => {});
        } else {
            await msg
                .edit({
                    content: `<@${interaction.user.id}> : **${data.first}**\n<@${user.id}> : **${data.second}**\nVous n'avez pas les mêmes numéros ! <@${user.id}>, appuyez sur le bouton pour faire la reverse`,
                    components,
                    embeds: []
                })
                .catch(() => {});
            const reversed = await waitForInteraction({
                message: msg,
                user,
                replies: {
                    everyone: {
                        content: 'Vous ne pouvez pas interagir avec cette interaction',
                        ephemeral: true
                    }
                },
                componentType: ComponentType.Button
            }).catch(() => {});
            if (!reversed)
                return msg
                    .edit({
                        components: components.map((x) => x.setDisabled(true))
                    })
                    .catch(() => {});
            data.max = Math.round(data.max / 2);
            reversed.deferUpdate().catch(() => {});

            const rfirst = await askNumber(interaction.user);
            if (!rfirst || rfirst === 'noSelection')
                return interaction
                    .editReply({
                        content: 'Annulé',
                        components: [],
                        embeds: []
                    })
                    .catch(() => {});

            const rsecond = await askNumber(user);
            if (!rsecond || rsecond === 'noSelection')
                return interaction
                    .editReply({
                        content: 'Annulé',
                        components: [],
                        embeds: []
                    })
                    .catch(() => {});

            data.first = rfirst;
            data.second = rsecond;

            let countdown = 4;
            const interval = setInterval(() => {
                countdown--;
                msg.edit({
                    content: `${countdown}...`,
                    components: []
                }).catch(() => {});
            }, 1000);

            setTimeout(async () => {
                clearInterval(interval);
                const components = [];

                if (data.first !== data.second) {
                    components.push(
                        row(
                            button({
                                style: 'Primary',
                                emoji: '🔁',
                                label: 'Reverse',
                                id: 'reverse'
                            })
                        )
                    );
                }
                if (data.first === data.second) {
                    await msg
                        .edit({
                            content: `<@${interaction.user.id}> : **${data.first}**\n<@${user.id}> : **${data.second}**\nVous avez choisit le même numéro ! <@${interaction.user.id}>, vous avez perdu **${data.mised}**`,
                            embeds: [],
                            components: []
                        })
                        .catch(() => {});
                } else {
                    await msg
                        .edit({
                            content: `<@${interaction.user.id}> : **${data.first}**\n<@${user.id}> : **${data.second}**\nVous n'avez pas les mêmes numéros !`,
                            components: [],
                            embeds: []
                        })
                        .catch(() => {});
                }
            }, 4000);
        }
    }, 4000);
});
