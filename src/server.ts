import express, { Express } from "express";
import http from "http";
import { discordClient } from "./services/discord.service";
import dotenv from "dotenv";
import bodyParser = require("body-parser");
import routes from "./routes/index.route";

dotenv.config();
const app: Express = express();
const server = http.createServer(app);
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api", routes);

// Initialize Discord Client
discordClient.login(process.env.BOT_TOKEN as string);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
