const twitchClientIds = [
    'ze1siwmgs1skpp8cz9anqf9tuicboh',
    'kimne78kx3ncx6brgo4mv6wki5h1ko'
];

const twitchEndpoints = [
    'https://gql.twitch.tv/gql',
    `https://corsproxy.io/?${encodeURIComponent('https://gql.twitch.tv/gql')}`
];

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function formatViewers(count) {
    return Number(count || 0).toLocaleString('pl-PL');
}

async function fetchTopTwitchStream() {
    const query = `
        query {
            streams(first: 1) {
                edges {
                    node {
                        title
                        viewersCount
                        previewImageURL(width: 1280, height: 720)
                        broadcaster {
                            login
                            displayName
                        }
                        game {
                            displayName
                        }
                    }
                }
            }
        }
    `;

    let lastError;

    for (const endpoint of twitchEndpoints) {
        for (const clientId of twitchClientIds) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Client-ID': clientId,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const payload = await response.json();

                if (payload.errors?.length) {
                    throw new Error(payload.errors.map((error) => error.message).join(', '));
                }

                const stream = payload?.data?.streams?.edges?.[0]?.node;
                if (stream) {
                    return stream;
                }
            } catch (error) {
                lastError = error;
            }
        }
    }

    throw lastError || new Error('Nie udało się pobrać streama z Twitcha.');
}

function getTwitchParentHost() {
    return window.location.hostname || '';
}

function renderFallbackTwitchCard(message = 'Nie udało się pobrać streama automatycznie.') {
    const twitchCell = document.getElementById('twitch-cell');
    if (!twitchCell) {
        return;
    }

    twitchCell.innerHTML = `
        <a class="twitch-card" href="https://www.twitch.tv/directory/all" target="_blank" rel="noopener noreferrer">
            <img src="pliki/zdjęcia/twitch.png" alt="Twitch">
            <div class="twitch-meta">
                <span class="twitch-status">🔴 LIVE</span>
                <h3>Twitch</h3>
                <p>${escapeHtml(message)}</p>
                <small>Kliknij, aby otworzyć katalog live.</small>
            </div>
        </a>
    `;
}

function renderTopTwitchStream(stream) {
    const twitchCell = document.getElementById('twitch-cell');
    if (!twitchCell) {
        return;
    }

    const streamTitle = escapeHtml(stream.title || 'Najpopularniejszy stream');
    const streamerName = escapeHtml(stream.broadcaster?.displayName || 'Twitch streamer');
    const gameName = escapeHtml(stream.game?.displayName || 'Live');
    const channelLogin = stream.broadcaster?.login || '';
    const streamLink = `https://www.twitch.tv/${channelLogin}`;
    const parentHost = getTwitchParentHost();

    if (!channelLogin) {
        renderFallbackTwitchCard();
        return;
    }

    if (!parentHost) {
        renderFallbackTwitchCard('Aby odtwarzać stream na stronie, uruchom projekt przez localhost lub Live Server.');
        return;
    }

    const embedUrl = `https://player.twitch.tv/?channel=${encodeURIComponent(channelLogin)}&parent=${encodeURIComponent(parentHost)}&muted=true&autoplay=false`;

    twitchCell.innerHTML = `
        <div class="twitch-embed-wrapper">
            <iframe
                class="twitch-frame"
                src="${embedUrl}"
                allow="autoplay; fullscreen"
                allowfullscreen>
            </iframe>
            <div class="twitch-embed-info">
                <span class="twitch-status">🔴 LIVE • ${formatViewers(stream.viewersCount)} widzów</span>
                <h3>${streamerName}</h3>
                <p>${gameName}</p>
                <small>${streamTitle}</small>
                <a class="twitch-open-link" href="${streamLink}" target="_blank" rel="noopener noreferrer">Otwórz kanał w Twitch</a>
            </div>
        </div>
    `;
}

async function loadTopTwitchStream() {
    const twitchCell = document.getElementById('twitch-cell');
    if (!twitchCell) {
        return;
    }

    try {
        const stream = await fetchTopTwitchStream();
        renderTopTwitchStream(stream);
    } catch (error) {
        console.error('Błąd podczas pobierania Twitch streama:', error);
        renderFallbackTwitchCard();
    }
}

document.addEventListener('DOMContentLoaded', loadTopTwitchStream);
