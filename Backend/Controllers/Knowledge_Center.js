import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();
const API_KEY=process.env.API_KEY;
const API_URL = "https://www.googleapis.com/youtube/v3/";

const fetchVideos = async (query) => {
  try {
    // Step 1: Search for videos
    const searchUrl = `${API_URL}search?part=snippet&type=video&q=${encodeURIComponent(
      query
    )}&key=${API_KEY}&maxResults=10`;

    const searchResponse = await axios.get(searchUrl);
    if (searchResponse.data.items.length === 0) {
      throw new Error("No videos found for the given query.");
    }

    const videoIds = searchResponse.data.items
      .map((item) => item.id.videoId)
      .join(",");

    // Step 2: Get detailed video information
    const videosUrl = `${API_URL}videos?part=snippet,contentDetails,player&id=${videoIds}&key=${API_KEY}`;
    const videosResponse = await axios.get(videosUrl);
    if (videosResponse.data.items.length === 0) {
      throw new Error("No video details found.");
    }

    // Step 3: Process video data
    const videoData = await Promise.all(
      videosResponse.data.items.map(async (video) => {
        const captionInfo = await fetchCaptions(video.id); // Fetch captions if available

        return {
          title: video.snippet.title,
          description: video.snippet.description,
          videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
          videoId: video.id,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          thumbnail:
            video.snippet.thumbnails.maxres?.url ||
            video.snippet.thumbnails.high.url,
          duration: video.contentDetails.duration,
          embedHtml: video.player.embedHtml,
          tags: video.snippet.tags || [],
          captions: captionInfo,
        };
      })
    );

    return videoData;
  } catch (error) {
    console.error(
      "Error fetching video data:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Helper function to fetch captions (requires OAuth2 authorization)
const fetchCaptions = async (videoId) => {
  try {
    const captionsUrl = `${API_URL}captions?part=snippet&videoId=${videoId}&key=${API_KEY}`;
    const response = await axios.get(captionsUrl);

    return response.data.items.map((caption) => ({
      language: caption.snippet.language,
      lastUpdated: caption.snippet.lastUpdated,
      trackKind: caption.snippet.trackKind,
      captionUrl: caption.snippet.downloadUrl,
    }));
  } catch (error) {
    console.log(
      "Captions not available or unauthorized:",
      error.response ? error.response.data : error.message
    );
    return [];
  }
};

const Knowledge_Center = (req, res) => {
  const { search } = req.query;

  fetchVideos(search)
    .then((videos) => {
      // Responding with the videos data
      res.status(200).json({ videos });
    })
    .catch((error) => {
      console.error(
        "Error fetching videos:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ error: "Failed to fetch videos" });
    });
};

export default Knowledge_Center;
