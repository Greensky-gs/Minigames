import { AmethystClient } from 'amethystjs';
import { Partials } from 'discord.js';
import { config } from 'dotenv';
config();

export const client = new AmethystClient(
    {
        intents: ['GuildMessages', 'MessageContent', 'Guilds'],
        partials: [Partials.Channel, Partials.Message]
    },
    {
        token: process.env.token,
        commandsFolder: './dist/commands',
        eventsFolder: './dist/events',
        preconditionsFolder: './dist/preconditions',
        debug: true,
        prefix: '!!'
    }
);

client.start({});
