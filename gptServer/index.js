import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'node:path';
import cors from 'cors';

import { LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const model = new LlamaModel({
    modelPath: path.join(__dirname, "models", "notus-7b-v1.Q5_K_M.gguf")
});
const context = new LlamaContext({ model });
const session = new LlamaChatSession({ context });

const app = express();
const server = createServer(app);

app.use(cors({
    origin: "*",
}));

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("New Connection");

    socket.on("message", async (msg) => {
        console.log("Received message from client:", msg);
        try {
            const botReply = await session.prompt(msg);
            console.log("Model's Reply:", botReply);

            socket.emit("response", botReply);
        } catch (error) {
            console.error("Error processing the message:", error);
            socket.emit("response", "Sorry, there was an error processing your request.");
        }
    });
});

const PORT = process.env.PORT || 8060;

app.get("/", (req, res) => {
    res.send("it's working");
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
