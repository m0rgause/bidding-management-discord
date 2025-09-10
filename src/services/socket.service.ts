import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

export class SocketService {
  private io: SocketIOServer;
  private discordClient: any;
  private channelId: string;
  constructor(server: HTTPServer, discordClient: any, channelId: string) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
      },
    });
    this.discordClient = discordClient;
    this.channelId = channelId;
    this.setupSocketEvents();
    this.setupDiscordEvents();
  }

  private setupSocketEvents() {
    this.io.on("connection", (socket: Socket) => {
      console.log("a user connected");
      socket.on("webmsg", async (msg: string) => {
        try {
          const channel = await this.discordClient.channels.fetch(
            this.channelId
          );
          if (channel?.type === 0) {
            await channel.send(msg);
          }
        } catch (error) {
          console.error("Error sending message to Discord:", error);
        }
      });
      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  }
  private setupDiscordEvents() {
    this.discordClient.on("ready", () => {
      console.log(`Logged in as ${this.discordClient.user?.tag}!`);
    });
    this.discordClient.on("messageCreate", (message: any) => {
      if (message.author.bot) return;
      this.io.emit("discordmsg", {
        user: message.author.username,
        content: message.content,
      });
    });
  }

  public getIOInstance(): SocketIOServer {
    return this.io;
  }
}
