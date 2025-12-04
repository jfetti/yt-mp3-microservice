import express from "express";
import cors from "cors";
import ytdl from "@distube/ytdl-core";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/convert", async (req, res) => {
  try {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl || !ytdl.validateURL(youtubeUrl)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(youtubeUrl);

    const format = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    if (!format || !format.url) {
      return res.status(500).json({ error: "No valid audio stream found" });
    }

    return res.json({
      success: true,
      downloadUrl: format.url,
      title: info.videoDetails.title,
    });
  } catch (err) {
    console.error("Microservice Error:", err);
    return res.status(500).json({ error: "Failed to extract audio" });
  }
});

app.get("/", (req, res) => {
  res.send("YouTube MP3 microservice running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Service running on port ${PORT}`));
