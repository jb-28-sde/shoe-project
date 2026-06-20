import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: "You are a friendly, helpful, and highly knowledgeable personal stylist bot for the 'Jute Le Lo' E-Commerce shoe store. Your role is to help users pair their outfits with the right sneakers or provide styling tips for specific shoes. Keep answers concise, trendy, and polite. Recommend types of clothing and colors that match the shoes well.",
        },
      });

      // Pass history to recreate context (though @google/genai doesn't explicitly expose `history` on create this way directly in basic examples, we can just send the current message, or if history is sent from client, we could iteratively push interactions. For simplicity, we just use a single generateContent or chat.sendMessage for the whole context, or let GenAI manage it if we reconstruct).
      // Since it's a simple stateless endpoint, we will just send all history as context in text, or let's use standard single query with context.
      
      let contextMsg = "";
      if (history && history.length > 0) {
        contextMsg = "Previous Conversation:\n" + history.map((m: any) => `${m.role}: ${m.text}`).join("\n") + "\n\nUser: " + message;
      } else {
        contextMsg = message;
      }

      const response = await chat.sendMessage({ message: contextMsg });
      res.json({ reply: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
