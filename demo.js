import axios from 'axios';

// Your API key from Google Developer Console
const API_KEY = 'AIzaSyCHpSlsbtcDpNTmNlXc_Fyh8AkRucnoNis'; 

// YouTube API base URL
const API_URL = 'https://www.googleapis.com/youtube/v3/';

const fetchVideos = async (query) => {
  try {
    // Construct the search URL to get videos based on a search query
    const url = `${API_URL}search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=10`;

    // Send the request to the API
    const response = await axios.get(url);

    // Extract the videos from the response
    const videos = response.data.items;
    console.log(videos)
    // Format the results
    const videoData = videos.map((video) => ({
      title: video.snippet.title,
      description: video.snippet.description,
      videoId: video.id.videoId,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      thumbnail: video.snippet.thumbnails.high.url,
    }));

    return videoData;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Example usage: Fetching videos for a search query "JavaScript tutorial"
fetchVideos('How to do SIP in Hindi')
  .then((videos) => {
    console.log('Fetched Videos:', videos);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
