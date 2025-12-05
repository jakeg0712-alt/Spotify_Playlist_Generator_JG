import musicService from './musicService.js';

/**
 * Recommendation Service - Creates playlists based on emotion using 3 specific artists
 * Elton John = happy
 * Crush 40 = energized
 * TheFatRat = chill
 */
class RecommendationService {
  constructor() {
    // Map emotions to artists
    this.emotionArtists = {
      happy: 'Elton John',
      energized: 'Crush 40',
      chill: 'TheFatRat',
    };

    // Cache for artist IDs (to avoid repeated searches)
    this.artistIds = {};
  }

  /**
   * Find artist ID by name
   */
  async findArtistId(artistName, accessToken) {
    // Check cache first
    if (this.artistIds[artistName]) {
      return this.artistIds[artistName];
    }

    try {
      const artists = await musicService.searchArtists(artistName, accessToken, 1);
      if (artists && artists.length > 0) {
        const artistId = artists[0].id;
        this.artistIds[artistName] = artistId;
        console.log(`Found artist ID for ${artistName}: ${artistId}`);
        return artistId;
      }
      throw new Error(`Artist "${artistName}" not found`);
    } catch (error) {
      console.error(`Error finding artist ${artistName}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate playlist based on emotion
   */
  async generatePlaylistByEmotion(emotion, accessToken, playlistLength = 20) {
    try {
      const artistName = this.emotionArtists[emotion.toLowerCase()];
      
      if (!artistName) {
        throw new Error(`Unknown emotion: ${emotion}. Available emotions: happy, energized, chill`);
      }

      console.log(`Generating ${emotion} playlist using ${artistName}...`);

      // Find artist ID
      const artistId = await this.findArtistId(artistName, accessToken);
      
      // Get artist's top tracks
      const tracks = await musicService.getArtistTopTracks(artistId, accessToken);
      
      // Limit to requested length
      const limitedTracks = tracks.slice(0, playlistLength);

      return {
        emotion,
        artist: artistName,
        tracks: limitedTracks.map((track) => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map((a) => a.name),
          album: track.album.name,
          duration_ms: track.duration_ms,
          preview_url: track.preview_url,
          external_urls: track.external_urls,
          images: track.album.images,
        })),
        totalTracks: limitedTracks.length,
      };
    } catch (error) {
      console.error('Error generating playlist by emotion:', error.message);
      throw error;
    }
  }

  /**
   * Get available emotions
   */
  getAvailableEmotions() {
    return Object.keys(this.emotionArtists);
  }

  /**
   * Get artist for emotion
   */
  getArtistForEmotion(emotion) {
    return this.emotionArtists[emotion.toLowerCase()];
  }
}

export default new RecommendationService();

