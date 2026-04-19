const apiKey = '23CAC94E18CA36E7EA73EC975739CDBE'; 
const proxyUrl = 'https://corsproxy.io/?';

let zapisanaListaGier = []; // Wszystkie gry pobrane z API
let przefiltrowaneGry = []; // Gry po uwzględnieniu wyszukiwarki
let wyswietloneGry = 0;
const PORCJA_GIER = 5; 

// --- 1. WYCIĄGANIE STEAMID Z LINKU ---
async function wyciagnijSteamID(link) {
    const cleanLink = link.replace(/\/$/, "");
    const parts = cleanLink.split('/');
    const lastPart = parts.pop();

    if (cleanLink.includes('/id/')) {
        const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${lastPart}`;
        const response = await fetch(proxyUrl + encodeURIComponent(resolveUrl));
        const data = await response.json();
        if (data.response.success === 1) return data.response.steamid;
        throw new Error("Użytkownik nie został znaleziony.");
    } else if (cleanLink.includes('/profiles/')) {
        return lastPart;
    }
    throw new Error("Nieprawidłowy format linku Steam.");
}

// --- 2. WYŚWIETLANIE PROFILU I NAKŁADANIE AWATARA ---
async function wyswietlProfil(steamId) {
    try {
        const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
        const response = await fetch(proxyUrl + encodeURIComponent(summaryUrl));
        const data = await response.json();
        const gracz = data.response.players[0];

        if (gracz) {
            const container = document.getElementById('userAvatarContainer');
            if (container) {
                // Nakładamy zdjęcie Steam na bazową ikonę
                container.innerHTML = `<img src="${gracz.avatarfull}" class="steam-avatar-overlay">`;
            }
            localStorage.setItem('zapisaneSteamID', steamId);
            
            // Jeśli jesteśmy na podstronie ze statystykami (istnieje rightcol), pobierz gry
            if (document.querySelector('.rightcol')) {
                await pobierzIGrafikiGier(steamId);
            }
        }
    } catch (error) {
        console.error("Błąd profilu:", error);
    }
}

// --- 3. POBIERANIE LISTY GIER ---
async function pobierzIGrafikiGier(steamId) {
    try {
        const gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&format=json`;
        const response = await fetch(proxyUrl + encodeURIComponent(gamesUrl));
        const data = await response.json();

        if (data.response && data.response.games) {
            zapisanaListaGier = data.response.games;
            przefiltrowaneGry = [...zapisanaListaGier];
            
            // Domyślne sortowanie po czasie gry
            sortujGry('playtime', document.querySelector('.leftcol-btn'));
        }
    } catch (error) {
        console.error("Błąd pobierania gier:", error);
    }
}

// --- 4. LOGIKA WYSZUKIWARKI ---
function filtrujGry() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase();
    
    przefiltrowaneGry = zapisanaListaGier.filter(gra => 
        gra.name.toLowerCase().includes(query)
    );

    wyswietloneGry = 0;
    const container = document.querySelector('.rightcol-content');
    if (container) {
        container.innerHTML = ""; 
        ladujWiecejGier();
    }
}

// --- 5. LOGIKA SORTOWANIA ---
function sortujGry(metoda, kliknietyBtn) {
    document.querySelectorAll('.leftcol-bar button').forEach(btn => btn.classList.remove('active-sort'));
    if (kliknietyBtn) kliknietyBtn.classList.add('active-sort');

    const sortFn = (a, b) => {
        if (metoda === 'playtime') return (b.playtime_forever || 0) - (a.playtime_forever || 0);
        if (metoda === 'name') return a.name.localeCompare(b.name);
        if (metoda === 'recent') return (b.rtime_last_played || 0) - (a.rtime_last_played || 0);
        return 0;
    };

    zapisanaListaGier.sort(sortFn);
    przefiltrowaneGry.sort(sortFn);

    wyswietloneGry = 0;
    const container = document.querySelector('.rightcol-content');
    if (container) {
        container.innerHTML = ""; 
        ladujWiecejGier();
    }
}

// --- 6. RENDEROWANIE LISTY (PAGINACJA) ---
function ladujWiecejGier() {
    const container = document.querySelector('.rightcol-content');
    if (!container) return;

    const kolejnaPorcja = przefiltrowaneGry.slice(wyswietloneGry, wyswietloneGry + PORCJA_GIER);

    if (kolejnaPorcja.length === 0 && wyswietloneGry === 0) {
        container.innerHTML = "<p style='color: #888; text-align: center; padding: 20px;'>Nie znaleziono gier.</p>";
        return;
    }

    kolejnaPorcja.forEach(gra => {
        const btn = document.createElement('button');
        btn.className = 'stat-button';
        
        const verticalImg = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${gra.appid}/library_600x900.jpg`;
        const wideImg = `https://cdn.akamai.steamstatic.com/steam/apps/${gra.appid}/header.jpg`;
        const placeholder = `https://community.cloudflare.steamstatic.com/public/images/applications/store/header_placeholder.png`;

        btn.innerHTML = `
            <img src="${verticalImg}" class="btn-img" 
                 onerror="if (this.src != '${wideImg}') { this.src = '${wideImg}'; } else { this.src = '${placeholder}'; }">
            <span class="btn-text">${gra.name}</span>
        `;

        btn.onclick = function() { 
            Showstats(gra.appid, gra.name, gra.playtime_forever, this); 
        };

        container.appendChild(btn);
    });

    wyswietloneGry += PORCJA_GIER;
}

// --- 7. OBSŁUGA SCROLLA W PRAWEJ KOLUMNIE ---
const rightCol = document.querySelector('.rightcol');
if (rightCol) {
    rightCol.addEventListener('scroll', function() {
        if (this.scrollTop + this.clientHeight >= this.scrollHeight - 20) {
            if (wyswietloneGry < przefiltrowaneGry.length) {
                ladujWiecejGier();
            }
        }
    });
}

// --- 8. SPRAWDZANIE OSIĄGNIĘĆ (DETAL GRY) ---
async function Showstats(appId, titleName, playtime, clickedBtn) {
    const content = document.querySelector('.leftcol-content');
    const steamId = localStorage.getItem('zapisaneSteamID');
    
    document.querySelectorAll('.rightcol button').forEach(btn => btn.classList.remove('active-title'));
    if (clickedBtn) clickedBtn.classList.add('active-title');

    content.innerHTML = `<p style="color: #66c0f4;">Ładowanie statystyk dla ${titleName}...</p>`;

    try {
        const statsUrl = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamId}&appid=${appId}`;
        const response = await fetch(proxyUrl + encodeURIComponent(statsUrl));
        const data = await response.json();

        let statsHTML = `<h3 style="color: #66c0f4; border-bottom: 1px solid #444; padding-bottom: 10px;">${titleName}</h3>`;
        statsHTML += `<p style="margin-top:10px;">Czas gry: <strong>${Math.round(playtime / 60)}h</strong></p>`;

        if (data.playerstats && data.playerstats.success && Array.isArray(data.playerstats.achievements)) {
            const achievements = data.playerstats.achievements;
            const unlocked = achievements.filter(a => Number(a.achieved) === 1).length;
            const total = achievements.length;
            const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

            statsHTML += `
                <div class="stat-row" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-top: 15px;color: white;">
                    <p>Osiągnięcia: <strong>${unlocked} / ${total}</strong> (${percent}%)</p>
                    <div style="background: #444; width: 100%; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 10px;">
                        <div style="background: #66c0f4; width: ${percent}%; height: 100%; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        } else {
            statsHTML += `<p style="color: #888; margin-top: 15px;"><i>Brak danych o osiągnięciach dla tego tytułu.</i></p>`;
        }
        content.innerHTML = statsHTML;
    } catch (e) {
        content.innerHTML = `<p style="color: #ff4d4d;">Błąd ładowania statystyk.</p>`;
    }
}

// --- 9. FUNKCJA LOGOWANIA (Z PRZYCISKU) ---
async function pokazDaneGracza() {
    const inputLink = document.getElementById('steamInput').value;
    if (!inputLink) return;
    try {
        const steamId = await wyciagnijSteamID(inputLink);
        await wyswietlProfil(steamId);
    } catch (e) { 
        alert(e.message); 
    }
}

// --- 10. WYLOGOWANIE ---
function wyloguj() {
    localStorage.removeItem('zapisaneSteamID');
    location.reload();
}

// --- 11. AUTO-ŁADOWANIE PRZY ODŚWIEŻENIU ---
window.onload = async function() {
    const zapamietaneID = localStorage.getItem('zapisaneSteamID');
    if (zapamietaneID) {
        // Mały opóźniacz, żeby upewnić się, że DOM jest gotowy
        setTimeout(() => {
            wyswietlProfil(zapamietaneID);
        }, 50);
    }
};