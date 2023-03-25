import { AmethystCommand } from "amethystjs";
import { ApplicationCommandOptionType } from "discord.js";
import { basicEmbed } from "../utils/toolbox";

export default new AmethystCommand({
    name: 'démineur',
    description: "Joue au démineur",
    options: [
        {
            name: "taille",
            description: "Taille de la grille",
            autocomplete: true,
            type: ApplicationCommandOptionType.Integer
        },
        {
            name: 'bombes',
            description: "Nombre de bombes",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            maxValue: 20,
            minValue: 1
        }
    ]
}).setChatInputRun(async({ interaction, options }) => {
    const size = options.getInteger('taille') ?? 10;
    const bombs = options.getInteger('bombes') ?? Math.floor((size * size * 15) / 100)

    if (size > 20) return interaction.reply({
        ephemeral: true,
        content: "Veuillez choisir un nombre inférieur à 20"
    }).catch(() => {})
    if (size * size < bombs) return interaction.reply({
        content: "Veuillez choisir un nombre de bombes inférieur au nombre de cases",
        ephemeral: true
    }).catch(() => {})

    const plate = (n: number, b: number): string[][] => {
        const plateau = [];
        for (let i = 0; i < n; i++) {
          plateau.push(new Array(n).fill(0));
        }
      
        let bombesPlacees = 0;
        while (bombesPlacees < b) {
          const x = Math.floor(Math.random() * n);
          const y = Math.floor(Math.random() * n);
          if (plateau[x][y] !== "X") {
            plateau[x][y] = "X";
            bombesPlacees++;
          }
        }
      
        for (let x = 0; x < n; x++) {
          for (let y = 0; y < n; y++) {
            if (plateau[x][y] === "X") {
              continue;
            }
            let nbBombesAdjacentes = 0;
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                const nx = x + i;
                const ny = y + j;
                if (nx >= 0 && nx < n && ny >= 0 && ny < n && plateau[nx][ny] === "X") {
                  nbBombesAdjacentes++;
                }
              }
            }
            plateau[x][y] = nbBombesAdjacentes;
          }
        }
      
        return plateau;
      }
    const format = (arr: string[][]) => {
        const emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣' ,'6️⃣', '7️⃣', '8️⃣'];
        return arr.map((a) => a.map(x => typeof x === 'number' ? emojis[x] : '💣'))
    }
  
    const game = plate(size, bombs);
    const embed = basicEmbed(interaction.user)
      .setTitle("Démineur")
      .setDescription(format(game).map((r) => r.map(x => `||${x}||`).join('')).join('\n'))
      .setColor('Orange')
    
    interaction.reply({
        embeds: [ embed ]
    }).catch(() => {});
})