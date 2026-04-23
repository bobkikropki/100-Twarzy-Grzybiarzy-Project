const API_KEY = '';
const searchBtn = document.getElementById('search-btn');
const loadMoreBtn = document.getElementById('load-more-btn');
const queryInput = document.getElementById('youtube-query');
const resultsContainer = document.getElementById('video-results');
const paginationContainer = document.getElementById('pagination-container');
const modal = document.getElementById('video-modal');
const player = document.getElementById('youtube-player');

let nextPageToken = '';
let currentQuery = '';

searchBtn.addEventListener('click', () => {
    performSearch();
});

queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

loadMoreBtn.addEventListener('click', () => {
    if (nextPageToken) {
        searchYouTube(currentQuery, nextPageToken);
    }
});

function performSearch() {
    const query = queryInput.value;
    if (query) {
        currentQuery = query;
        nextPageToken = '';
        resultsContainer.innerHTML = '';
        searchYouTube(query);
    }
}

async function searchYouTube(query, token = '') {
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=16&q=${encodeURIComponent(query)}&type=video&videoDuration=medium&key=${API_KEY}`;
    
    if (token) {
        url += `&pageToken=${token}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items) {
            displayResults(data.items);
            nextPageToken = data.nextPageToken || '';
            
            if (paginationContainer) {
                paginationContainer.style.display = nextPageToken ? 'flex' : 'none';
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function displayResults(videos) {
    videos.forEach(video => {
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const thumbnail = video.snippet.thumbnails.medium.url;

        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.style.cursor = 'pointer';
        
        videoCard.onclick = () => openModal(videoId);

        videoCard.innerHTML = `
            <img src="${thumbnail}" alt="${title}" style="width: 100%; aspect-ratio: 16/9; border-radius: 2px; margin-bottom: 5px; object-fit: cover;">
            <h3>${title}</h3>
        `;
        resultsContainer.appendChild(videoCard);
    });
}

function openModal(videoId) {
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    player.src = '';
}

window.onclick = (event) => {
    if (event.target == modal) closeModal();
};

const gameSearchInput = document.getElementById('game-search-input');
gameSearchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const gameTitle = e.target.value.trim();
        if (gameTitle !== "") {
            fetchGamingLive(gameTitle);
        }
    }
});

async function fetchGamingLive(specificGame = null) {
    const ytCell = document.getElementById('yt-live-cell');
    if (!ytCell) return;

    const query = specificGame ? `${specificGame} pl` : 'gra|pl|polska';
    const maxResults = specificGame ? '5' : '10';

    const params = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        eventType: 'live',
        order: 'viewCount',
        videoCategoryId: '20',
        q: query,
        relevanceLanguage: 'pl',
        regionCode: 'PL',
        maxResults: maxResults,
        key: API_KEY
    });

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.items.length);
            const video = data.items[randomIndex];
            
            const videoId = video.id.videoId;
            const title = video.snippet.title;
            const thumbnail = video.snippet.thumbnails.high.url;
            const badgeText = specificGame ? `Na żywo: ${specificGame}` : "Gry na żywo (PL)";

            ytCell.innerHTML = `
                <div class="live-container" onclick="openModal('${videoId}')" style="position: relative; width: 100%; height: 100%; cursor: pointer;">
                    <span class="live-badge" style="position: absolute; top: 15px; left: 15px; background: #e74c3c; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; z-index: 10;">${badgeText}</span>
                    <img src="${thumbnail}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
                    <div class="live-title-overlay" style="position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.7); color: white; padding: 15px; box-sizing: border-box; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; font-size: 14px;">${title}</div>
                </div>
            `;
        } else {
            const message = specificGame ? `Brak streamów z ${specificGame}` : "Nie znaleziono transmisji";
            ytCell.innerHTML = `<div class="yt-loading">${message}</div>`;
        }
    } catch (error) {
        ytCell.innerHTML = '<div class="yt-loading">Błąd połączenia</div>';
    }
}

fetchGamingLive();