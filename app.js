// API Base URL
const API_BASE = 'http://localhost:3000/api';

// State
let currentUser = null;
let selectedEmotion = null;
let currentPlaylist = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadEmotions();
});

// Setup event listeners
function setupEventListeners() {
    // Emotion button clicks
    document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
            // Select clicked button
            btn.classList.add('selected');
            selectedEmotion = btn.dataset.emotion;
        });
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', generatePlaylist);
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportPlaylist);
    
    // Load user button
    document.getElementById('loadUserBtn').addEventListener('click', loadUserPreferences);
}

// Load available emotions
async function loadEmotions() {
    try {
        const response = await fetch(`${API_BASE}/recommendations/emotions`);
        const data = await response.json();
        console.log('Available emotions:', data.emotions);
    } catch (error) {
        console.error('Error loading emotions:', error);
    }
}

// Load user preferences
async function loadUserPreferences() {
    const userId = document.getElementById('userId').value.trim();
    if (!userId) {
        alert('Please enter a profile name');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`);
        if (response.status === 404) {
            // Create new user
            await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, playlistLength: 20 })
            });
            currentUser = { id: userId, playlistLength: 20 };
            document.getElementById('playlistLength').value = 20;
            alert(`Profile "${userId}" created!`);
        } else {
            const data = await response.json();
            currentUser = data.user;
            if (currentUser.playlistLength) {
                document.getElementById('playlistLength').value = currentUser.playlistLength;
            }
            alert(`Welcome back, ${userId}!`);
        }
        hideLoading();
    } catch (error) {
        console.error('Error loading user:', error);
        showError('Failed to load profile');
        hideLoading();
    }
}

// Generate playlist
async function generatePlaylist() {
    if (!selectedEmotion) {
        alert('Please select an emotion first');
        return;
    }

    const playlistLength = parseInt(document.getElementById('playlistLength').value) || 20;
    const userId = currentUser ? currentUser.id : null;

    showLoading();
    try {
        const response = await fetch(`${API_BASE}/recommendations/emotion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emotion: selectedEmotion, userId })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate playlist');
        }
        
        const playlist = await response.json();
        currentPlaylist = playlist;
        displayPlaylist(playlist);
        
        // Save playlist length preference if user is logged in
        if (currentUser && playlistLength !== currentUser.playlistLength) {
            await fetch(`${API_BASE}/users/${currentUser.id}/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistLength })
            });
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error generating playlist:', error);
        showError('Failed to generate playlist: ' + error.message);
        hideLoading();
    }
}

// Display playlist
function displayPlaylist(playlist) {
    const resultsSection = document.getElementById('playlistResults');
    resultsSection.style.display = 'block';
    
    const infoDiv = document.getElementById('playlistInfo');
    const emotionName = playlist.emotion.charAt(0).toUpperCase() + playlist.emotion.slice(1);
    infoDiv.innerHTML = `
        <strong>${emotionName} Playlist</strong>
        <br><small>Artist: ${playlist.artist}</small>
        <br><small>${playlist.totalTracks} tracks</small>
    `;
    
    const tracksDiv = document.getElementById('playlistTracks');
    tracksDiv.innerHTML = '';
    
    playlist.tracks.forEach(track => {
        const item = document.createElement('div');
        item.className = 'track-item';
        item.innerHTML = `
            ${track.images && track.images.length > 0 
                ? `<img src="${track.images[2].url}" alt="${track.name}" class="track-image">` 
                : '<div class="track-image" style="background: #ddd;"></div>'}
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artists.join(', ')}</div>
                <div class="track-album">${track.album}</div>
            </div>
            <div class="track-actions">
                ${track.preview_url 
                    ? `<a href="${track.preview_url}" target="_blank">Preview</a>` 
                    : ''}
                ${track.external_urls && track.external_urls.spotify 
                    ? `<a href="${track.external_urls.spotify}" target="_blank">Open in Spotify</a>` 
                    : ''}
            </div>
        `;
        tracksDiv.appendChild(item);
    });
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Export playlist as JSON
function exportPlaylist() {
    if (!currentPlaylist) {
        alert('No playlist to export');
        return;
    }
    
    const dataStr = JSON.stringify(currentPlaylist, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `playlist-${currentPlaylist.emotion}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Utility functions
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showError(message) {
    alert('Error: ' + message);
}

