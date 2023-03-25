import {
    ButtonInteraction,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    EmbedField,
    InteractionCollector,
    User
} from 'discord.js';
import { basicEmbed, button, row } from '../utils/toolbox';

type signType = 'X' | 'O' | 'N';
type turnType = 'first' | 'second';
export class Morpion {
    private first: User;
    private second: User;
    private matrix: [signType, signType, signType, signType, signType, signType, signType, signType, signType] = [
        'N',
        'N',
        'N',
        'N',
        'N',
        'N',
        'N',
        'N',
        'N'
    ];
    private turn: turnType = 'first';
    private ended: boolean = false;
    private ctx: CommandInteraction;
    private signs: Record<signType, string> = {
        N: '⬛',
        O: '⭕',
        X: '❌'
    };
    private collector: InteractionCollector<ButtonInteraction>;

    constructor({ users, interaction }: { users: [User, User]; interaction: CommandInteraction }) {
        this.first = users[0];
        this.second = users[1];
        this.ctx = interaction;

        this.sendFirstGrid();
    }

    private get turnPlayer() {
        if (this.turn === 'first') return this.first;
        return this.second;
    }
    private get playerSign() {
        if (this.turn === 'first') return 'X';
        return 'O';
    }
    private components() {
        const buttons = this.matrix.map((x, i) =>
            button({
                label: (i + 1).toString(),
                style: i % 5 === 0 ? 'Primary' : 'Secondary',
                id: i.toString(),
                disabled: x !== 'N'
            })
        );
        return [
            row(...buttons.slice(0, 5)),
            row(
                ...buttons.slice(5),
                button({
                    label: 'Abandonner',
                    emoji: '🏳️',
                    id: 'resign',
                    style: 'Danger'
                })
            )
        ];
    }
    private displayGrid() {
        const sign = (index: number) =>
            this.matrix[index] === 'N'
                ? ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'][index]
                : this.signs[this.matrix[index]];
        return `${sign(0)} | ${sign(1)} | ${sign(2)}\n${sign(3)} | ${sign(4)} | ${sign(5)}\n${sign(6)} | ${sign(
            7
        )} | ${sign(8)}`;
    }
    private turnField(): EmbedField {
        return {
            name: 'Tour',
            value: this.turn === 'first' ? `<@${this.first.id}>` : `<@${this.second.id}>`,
            inline: true
        };
    }
    private generateEmbed() {
        return new EmbedBuilder()
            .setFields(
                {
                    name: `Morpion`,
                    value: this.displayGrid(),
                    inline: true
                },
                this.turnField()
            )
            .setColor(this.ctx.guild?.members?.me?.displayHexColor ?? 'Orange')
            .setTimestamp();
    }
    private winEmbed() {
        const winner = this.checkWinner() === 'O' ? this.second : this.first;
        return basicEmbed(winner)
            .setFields(
                {
                    name: 'Morpion',
                    value: this.displayGrid(),
                    inline: false
                },
                {
                    name: 'Gagnant',
                    value: `<@${winner.id}>`
                }
            )
            .setColor('#00ff00');
    }
    private drawEmbed() {
        return basicEmbed(this.first)
            .setTitle('Égalité')
            .setDescription(`Vous avez fait match nul\n${this.displayGrid()}`)
            .setColor('Grey');
    }
    private resign(user: User) {
        this.ctx.editReply({
            embeds: [
                basicEmbed(user)
                    .setTitle('Partie annulée')
                    .setDescription(`La partie a été abandonnée par <@${user.id}>\n\n${this.displayGrid()}`)
                    .setColor('Yellow')
            ],
            components: []
        });
        this.ended = true;
    }
    private placeSign(index: number) {
        this.matrix[index] = this.playerSign;
    }
    private switchTurn() {
        if (this.turn === 'first') this.turn = 'second';
        else this.turn = 'first';
        return this.turn;
    }
    private checkWinner(): signType {
        let winner: signType = 'N';
        [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 5, 6]
        ].forEach((arr) => {
            if (
                this.matrix[arr[0]] === this.matrix[arr[1]] &&
                this.matrix[arr[1]] === this.matrix[arr[2]] &&
                this.matrix[arr[1]] !== 'N'
            )
                winner = this.matrix[arr[1]];
        });

        return winner;
    }
    private checkDraw() {
        return this.matrix.filter((x) => x !== 'N').length === 9;
    }
    private async sendFirstGrid() {
        await this.ctx
            .editReply({
                embeds: [this.generateEmbed()],
                components: this.components()
            })
            .catch(() => {});
        const msg = await this.ctx.fetchReply().catch(() => {});

        if (!msg)
            return this.ctx
                .editReply({
                    content: "La partie a été annulée à cause d'une erreur interne",
                    embeds: [],
                    components: []
                })
                .catch(() => {});

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            idle: 120000
        });

        this.collector = collector;
        collector.on('collect', (ctx) => {
            if (![this.first.id, this.second.id].includes(ctx.user.id)) {
                ctx.reply({
                    content: 'Vous ne pouvez pas interagir avec ce message',
                    ephemeral: true
                }).catch(() => {});
                return;
            }

            if (ctx.customId === 'resign') {
                collector.stop('resign');
                this.resign(ctx.user);
                return;
            }
            if (ctx.user.id !== this.turnPlayer.id) {
                ctx.reply({
                    ephemeral: true,
                    content: "Ce n'est pas à vous de jouer"
                }).catch(() => {});
                return;
            }
            this.placeSign(parseInt(ctx.customId));
            if (this.checkWinner() !== 'N') {
                collector.stop('winner');
                this.ctx
                    .editReply({
                        embeds: [this.winEmbed()],
                        components: []
                    })
                    .catch(() => {});
                this.ended = true;
                return;
            }
            if (this.checkDraw()) {
                this.ctx
                    .editReply({
                        embeds: [this.drawEmbed()],
                        components: []
                    })
                    .catch(() => {});
                collector.stop('draw');
                this.ended = true;
                return;
            }
            ctx.deferUpdate().catch(() => {});
            this.switchTurn();

            this.ctx
                .editReply({
                    embeds: [this.generateEmbed()],
                    components: this.components()
                })
                .catch(() => {});
        });

        collector.on('end', (c, reason) => {
            if (['resign', 'winner', 'draw'].includes(reason)) return;
            this.ctx
                .editReply({
                    embeds: [this.drawEmbed()],
                    components: []
                })
                .catch(() => {});
        });
    }
}
