# Spotify Playlist Generator (Simple Version)

A simple web application that uses the Spotify Web API to generate playlists based on emotions using 3 specific artists.

## Features

- **3 Emotions, 3 Artists:**
  - **Happy** → Elton John
  - **Energized** → Crush 40
  - **Chill** → TheFatRat
- **Simple Interface:** Just select an emotion and generate a playlist
- **Music Service:** Fetches top tracks from the selected artist
- **User Service:** Optional profile to save playlist length preferences

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Spotify Developer Account (free)

## Setup Instructions

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details
5. Copy your **Client ID** and **Client Secret**

### 2. Install Dependencies

```bash
cd spotify-playlist-generator
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=https://example.com
PORT=3000
```

Replace the values with your actual Spotify credentials.

### 4. Run the Application

```bash
npm start
```

The server will start on `http://localhost:3000`

### 5. Open in Browser

Navigate to `http://localhost:3000` in your web browser.

## Usage

1. **Select an Emotion:** Click on one of the three emotion buttons (Happy, Energized, or Chill)
2. **Set Playlist Length:** Adjust the number of tracks (default: 20)
3. **Generate Playlist:** Click "Generate Playlist"
4. **View Results:** The playlist will display with track information and links to Spotify

### Optional: Create a Profile

- Enter a profile name (any name you want)
- Click "Load/Create Profile" to save your playlist length preference

## API Endpoints

### Recommendation Service
- `POST /api/recommendations/emotion` - Generate playlist by emotion
- `GET /api/recommendations/emotions` - Get available emotions

### Music Service
- `GET /api/music/search/tracks?q={query}` - Search for tracks
- `GET /api/music/search/artists?q={query}` - Search for artists

### User Service
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create/update user
- `PUT /api/users/:id/preferences` - Update preferences

## Project Structure

```
spotify-playlist-generator/
├── services/
│   ├── musicService.js          # Spotify API integration
│   ├── recommendationService.js  # Emotion to artist mapping
│   └── userService.js           # User preferences storage
├── public/
│   ├── index.html               # Main UI
│   ├── styles.css               # Styling
│   └── app.js                   # Frontend JavaScript
├── data/
│   └── users.json              # User data (auto-created)
├── server.js                   # Express server
├── package.json                # Dependencies
├── .env                        # Environment variables (create this)
└── README.md                   # This file
```

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **API:** Spotify Web API
- **Storage:** JSON file (for user preferences)

## Notes

- This application uses Spotify's Client Credentials flow (read-only access)
- Playlists are generated from each artist's top tracks
- User preferences are stored locally in `data/users.json`

## License

MIT

