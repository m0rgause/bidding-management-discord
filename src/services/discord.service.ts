import { Client, GatewayIntentBits, ChannelType } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!BOT_TOKEN || !CHANNEL_ID) {
  throw new Error(
    "BOT_TOKEN and CHANNEL_ID must be set in the environment variables."
  );
}

export const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

discordClient.once("ready", () => {
  console.log(`Logged in as ${discordClient.user?.tag}!`);
});

// Export functions for sending messages to Discord
export const sendToDiscord = async (message: string, username?: string) => {
  try {
    const channel = await discordClient.channels.fetch(CHANNEL_ID);
    if (channel && channel.type === ChannelType.GuildText) {
      const formattedMessage = username
        ? `**${username}**: ${message}`
        : message;
      await channel.send(formattedMessage);
      return true;
    }
  } catch (error) {
    console.error("Error sending message to Discord:", error);
    return false;
  }
};
