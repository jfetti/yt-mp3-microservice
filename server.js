import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

function extractVideoId(url) {
  const match = url.match(/v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
  return match ? match[1] : null;
}

// choose a reliable backend
const PIPED_API = "https://pipedapi.syncpundit.com";  // BEST uptime

app.post("/convert", async (req, res) => {
  try {
    const { youtubeUrl } = req.body;

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const apiUrl = `${PIPED_API}/streams/${videoId}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.audioStreams || data.audioStreams.length === 0) {
      console.error("No audio streams:", data);
      return res.status(500).json({ error: "No audio streams available" });
    }

    const highest = data.audioStreams.sort((a, b) => b.bitrate - a.bitrate)[0];

    return res.json({
      success: true,
      downloadUrl: highest.url,
      title: data.title,
    });

  } catch (err) {
    console.error("Microservice Error:", err);
    return res.status(500).json({ error: "Failed to extract audio" });
  }
});

app.get("/", (req, res) => {
  res.send("YouTube MP3 microservice (stable Piped backend) running");
});

app.listen(3000, () => console.log("Service running on port 3000"));
