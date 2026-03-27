
const API_KEY = 'AIzaSyAUkxsoa0oj4nmYCu7cmuJlVdo4UeZJvJY';
const searchBtn = document.getElementById('search-btn');
const queryInput = document.getElementById('youtube-query');
const resultsContainer = document.getElementById('video-results');
const modal = document.getElementById('video-modal');
const player = document.getElementById('youtube-player');

searchBtn.addEventListener('click', () => {
    const query = queryInput.value;
    if (query) searchYouTube(query);
});

queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = queryInput.value;
        if (query) searchYouTube(query);
    }
});

async function searchYouTube(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=16&q=${encodeURIComponent(query)}&type=video&videoDuration=medium&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.items) displayResults(data.items);
    } catch (error) {
        console.error(error);
    }
}

function displayResults(videos) {
    resultsContainer.innerHTML = '';
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