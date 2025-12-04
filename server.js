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

app.post("/convert", async (req, res) => {
  try {
    const { youtubeUrl } = req.body;

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const apiUrl = `https://piped.video/streams/${videoId}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.audioStreams || data.audioStreams.length === 0) {
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
  res.send("YouTube MP3 microservice (Piped backend) running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Service running on port ${PORT}`));
