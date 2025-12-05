import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import musicService from './services/musicService.js';
import recommendationService from './services/recommendationService.js';
import userService from './services/userService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store access token (in production, use proper token management)
let accessToken = null;
let tokenExpiry = null;

// Middleware to get/refresh access token
async function ensureAccessToken() {
  if (!accessToken || (tokenExpiry && Date.now() >= tokenExpiry)) {
    try {
      accessToken = await musicService.getAccessToken(
        process.env.SPOTIFY_CLIENT_ID,
        process.env.SPOTIFY_CLIENT_SECRET
      );
      // Spotify tokens typically expire in 3600 seconds
      tokenExpiry = Date.now() + 3600 * 1000;
      console.log('Spotify access token obtained');
    } catch (error) {
      console.error('Failed to get access token:', error.message);
      throw new Error('Failed to authenticate with Spotify. Check your credentials in .env file');
    }
  }
  return accessToken;
}

// ==================== Test Route ====================

app.get('/api/test', async (req, res) => {
  try {
    const token = await ensureAccessToken();
    res.json({ 
      success: true, 
      message: 'Spotify API connection successful',
      tokenReceived: !!token 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// ==================== Recommendation Service Routes ====================

// Generate playlist by emotion
app.post('/api/recommendations/emotion', async (req, res) => {
  try {
    const token = await ensureAccessToken();
    const { emotion, userId } = req.body;

    if (!emotion) {
      return res.status(400).json({ error: 'Emotion is required' });
    }

    let playlistLength = 20;
    if (userId) {
      const user = await userService.getUser(userId);
      if (user && user.playlistLength) {
        playlistLength = user.playlistLength;
      }
    }

    const playlist = await recommendationService.generatePlaylistByEmotion(
      emotion,
      token,
      playlistLength
    );
    
    res.json(playlist);
  } catch (error) {
    console.error('Error in /api/recommendations/emotion:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate playlist',
      details: error.message
    });
  }
});

// Get available emotions
app.get('/api/recommendations/emotions', (req, res) => {
  const emotions = recommendationService.getAvailableEmotions();
  const emotionInfo = emotions.map(emotion => ({
    emotion,
    artist: recommendationService.getArtistForEmotion(emotion)
  }));
  res.json({ emotions: emotionInfo });
});

// ==================== Music Service Routes ====================

// Search tracks
app.get('/api/music/search/tracks', async (req, res) => {
  try {
    const token = await ensureAccessToken();
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const tracks = await musicService.searchTracks(q, token, parseInt(limit));
    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search artists
app.get('/api/music/search/artists', async (req, res) => {
  try {
    const token = await ensureAccessToken();
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const artists = await musicService.searchArtists(q, token, parseInt(limit));
    res.json({ artists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== User Service Routes ====================

// Get user
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await userService.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update user
app.post('/api/users', async (req, res) => {
  try {
    const user = await userService.saveUser(req.body);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user preferences
app.put('/api/users/:id/preferences', async (req, res) => {
  try {
    const user = await userService.updatePreferences(req.params.id, req.body);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth callback route
app.get('/callback', (req, res) => {
  res.redirect('/');
});

// Start server
app.listen(PORT, () => {
  console.log(`Spotify Playlist Generator server running on http://localhost:${PORT}`);
  console.log(`Make sure to set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env file`);
  console.log(`Emotions available: happy (Elton John), energized (Crush 40), chill (TheFatRat)`);
});

