import { ButtonInteraction, CommandInteraction, ComponentType, EmbedBuilder, EmbedField, InteractionCollector, User } from "discord.js";
import { basicEmbed, button, row } from "../utils/toolbox";

type signType = 'X' | 'O' | 'N';
type turnType = 'first' | 'second';
export class Morpion {
    private first: User;
    private second: User;
    private matrix: [signType, signType, signType, signType, signType, signType, signType, signType, signType] = ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N']
    private turn: turnType = 'first';
    private ended: boolean = false;
    private ctx: CommandInteraction;
    private signs: Record<signType, string> = {
        N: '⬛',
        O: '⭕',
        X: '❌'
    }
    private collector: InteractionCollector<ButtonInteraction>


    constructor({ users, interaction }: { users: [User, User], interaction: CommandInteraction }) {
        this.first = users[0];
        this.second = users[1];
        this.ctx = interaction;
    }

    private components() {
        const buttons = this.matrix.map((x, i) => button({
            label: (i + 1).toString(),
            style: i % 3 === 0 ? 'Primary' : 'Secondary',
            id: i.toString(),
            disabled: x !== 'N'
        }));
        return [
            row(...buttons.slice(0, 4)),
            row(...buttons.slice(5), button({
                label: 'Abandonner',
                emoji: '🏳️',
                id: 'resign',
                style: 'Danger'
            }))
        ]
    }
    private displayGrid() {
        const sign = (index: number) => this.signs[this.matrix[index]]
        return `${sign(0)} | ${sign(1)} | ${sign(2)}\n${sign(3)} | ${sign(4)} | ${sign(5)}\n${sign(6)} | ${sign(7)} | ${sign(8)}`;
    }
    private turnField(): EmbedField {
        return {
            name: 'Tour',
            value: this.turn === 'first' ? `<@${this.first.id}>` : `<@${this.second.id}>`,
            inline: false
        }
    }
    private generateEmbed() {
        return new EmbedBuilder()
            .setTitle("Morpion")
            .setDescription(this.displayGrid())
            .setFields(this.turnField())
            .setTimestamp()
    }
    private resign(user: User) {
        this.ctx.editReply({
            embeds: [
                basicEmbed(user)
                    .setTitle("Partie annulée")
                    .setDescription(`La partie a été abandonnée par <@${user.id}>\n\n${this.displayGrid()}`)
            ]
        })
    }
    private async sendFirstGrid() {
        await this.ctx.editReply({
            embeds: [this.generateEmbed()],
            components: this.components()
        }).catch(( )=> {})
        const msg = await this.ctx.fetchReply().catch(() => {});

        if (!msg) return this.ctx.editReply({
            content: "La partie a été annulée à cause d'une erreur interne",
            embeds: [],
            components:[]
        }).catch(() => {})

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button
        });

        this.collector = collector;
        collector.on('collect', (ctx) => {
            if (![this.first.id, this.second.id].includes(ctx.user.id)) {
                ctx.reply({
                    content: "Vous ne pouvez pas interagir avec ce message",
                    ephemeral: true
                }).catch(( )=> {})
                return;
            }

            if (ctx.customId === 'resign') {

            }
        })
    }
}