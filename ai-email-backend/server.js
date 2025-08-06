import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";

// Load environment variables from .env
dotenv.config();

const app = express();

// CORS configuration: adjust origins as per your frontend deployment URLs
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://ai-email-edsxptex6-kailashs-projects-e090b888.vercel.app/"  // add your deployed frontend URL here
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.use(express.json());

// Routes remain the same
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

app.get("/api/generate", (req, res) => {
  res.send("❗ This endpoint expects a POST request with a 'prompt' field.");
});

app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt'" });
  }
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are a helpful assistant that writes professional emails." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const email = response.data?.choices?.[0]?.message?.content;

    if (!email) {
      throw new Error("No email content returned from Groq.");
    }

    res.json({ email });
  } catch (err) {
    res.status(500).json({
      error: "Failed to generate email",
      details: err.response?.data || err.message
    });
  }
});

app.post("/api/send", async (req, res) => {
  const { recipients, subject, content } = req.body;
  if (!recipients || !content) {
    return res.status(400).json({ error: "Recipients and content are required" });
  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients,
      subject: subject || "AI Generated Email",
      text: content
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "✅ Email sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email", details: err.message });
  }
});

// Export the app for Vercel serverless function handler
export default app;
