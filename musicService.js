import axios from 'axios';

/**
 * Music Service - Fetches JSON about songs/artists from Spotify API
 */
class MusicService {
  constructor() {
    this.baseURL = 'https://api.spotify.com/v1';
  }

  /**
   * Get access token using client credentials flow
   */
  async getAccessToken(clientId, clientSecret) {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error.message);
      throw error;
    }
  }

  /**
   * Search for artists
   */
  async searchArtists(query, accessToken, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          q: query,
          type: 'artist',
          limit: limit,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.artists.items;
    } catch (error) {
      console.error('Error searching artists:', error.message);
      throw error;
    }
  }

  /**
   * Get artist details by ID
   */
  async getArtist(artistId, accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/artists/${artistId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting artist:', error.message);
      throw error;
    }
  }

  /**
   * Get artist's top tracks
   */
  async getArtistTopTracks(artistId, accessToken, market = 'US') {
    try {
      const response = await axios.get(
        `${this.baseURL}/artists/${artistId}/top-tracks`,
        {
          params: { market },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.tracks;
    } catch (error) {
      console.error('Error getting artist top tracks:', error.message);
      if (error.response) {
        console.error('Spotify API Error:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Search for tracks
   */
  async searchTracks(query, accessToken, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          q: query,
          type: 'track',
          limit: limit,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.tracks.items;
    } catch (error) {
      console.error('Error searching tracks:', error.message);
      throw error;
    }
  }
}

export default new MusicService();

