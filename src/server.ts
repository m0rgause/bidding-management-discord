import express, { Express } from "express";
import http from "http";
import cors from "cors";
import { discordClient } from "./services/discord.service";
import { SocketService } from "./services/socket.service";
import dotenv from "dotenv";
import bodyParser = require("body-parser");
import routes from "./routes/index.route";
import { ApiResponse } from "./types";

dotenv.config();
const app: Express = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());
// app.use(express.static("public"));

// Initialize Socket.IO with Discord integration
const CHANNEL_ID = process.env.CHANNEL_ID;
if (!CHANNEL_ID) {
  throw new Error("CHANNEL_ID must be set in environment variables");
}

const socketService = new SocketService(server, discordClient, CHANNEL_ID);

// Make socket service available globally for controllers
declare global {
  var socketService: SocketService;
}
global.socketService = socketService;

// Routes
app.get("/", (req, res) => {
  res.json({
    data: null,
    message: "Welcome to RadarJoki API",
    success: true,
  } as ApiResponse<null>);
});

app.use("/api", routes);

// Initialize Discord Client
discordClient.login(process.env.BOT_TOKEN as string);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
