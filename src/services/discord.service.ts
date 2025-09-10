import { Client, GatewayIntentBits } from "discord.js";
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

discordClient.once("clientReady", () => {
  console.log(`Logged in as ${discordClient.user?.tag}!`);
});

discordClient.on("messageCreate", async (message) => {
  if (message.channelId === CHANNEL_ID && !message.author.bot) {
    console.log(`Message from ${message.author.tag}: ${message.content}`);
    // You can add more logic here to handle the message as needed
  }
});
