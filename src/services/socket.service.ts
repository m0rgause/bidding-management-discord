import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Client, ChannelType } from "discord.js";

export class SocketService {
  private io: SocketIOServer;
  private discordClient: Client;
  private channelId: string;

  constructor(server: HTTPServer, discordClient: Client, channelId: string) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    this.discordClient = discordClient;
    this.channelId = channelId;
    this.setupSocketEvents();
    this.setupDiscordEvents();
  }

  private setupSocketEvents() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle messages from web to Discord
      socket.on(
        "webmsg",
        async (data: { message: string; username?: string }) => {
          try {
            const channel = await this.discordClient.channels.fetch(
              this.channelId
            );
            if (channel && channel.type === ChannelType.GuildText) {
              const formattedMessage = data.username
                ? `**${data.username}**: ${data.message}`
                : data.message;
              await channel.send(formattedMessage);
              console.log(`Message sent to Discord: ${formattedMessage}`);
            }
          } catch (error) {
            console.error("Error sending message to Discord:", error);
            socket.emit("error", {
              message: "Failed to send message to Discord",
            });
          }
        }
      );

      // Handle project notifications
      socket.on("project_created", (data: any) => {
        socket.broadcast.emit("new_project", data);
      });

      socket.on("project_updated", (data: any) => {
        socket.broadcast.emit("project_update", data);
      });

      socket.on("bid_placed", (data: any) => {
        socket.broadcast.emit("new_bid", data);
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  private setupDiscordEvents() {
    this.discordClient.on("ready", () => {
      console.log(`Discord client ready: ${this.discordClient.user?.tag}!`);
    });

    this.discordClient.on("messageCreate", (message: any) => {
      // Only process messages from the specified channel and not from bots
      if (message.channelId === this.channelId && !message.author.bot) {
        const messageData = {
          id: message.id,
          user: message.author.username,
          content: message.content,
          timestamp: message.createdTimestamp,
          avatar: message.author.displayAvatarURL(),
        };

        // Broadcast Discord message to all connected web clients
        this.io.emit("discordmsg", messageData);
        console.log(
          `Discord message broadcasted: ${message.author.username}: ${message.content}`
        );
      }
    });
  }

  // Method to send notifications to all connected clients
  public broadcastNotification(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Method to send notification to specific user
  public sendToUser(socketId: string, event: string, data: any) {
    this.io.to(socketId).emit(event, data);
  }

  public getIOInstance(): SocketIOServer {
    return this.io;
  }
}
