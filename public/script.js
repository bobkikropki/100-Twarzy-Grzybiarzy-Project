function dropDownList() {
    document.getElementById("myDropdown").classList.toggle("show");
}



function toggleA11yPanel() {
    const a11yPanel = document.getElementById('a11y-panel');
    if (a11yPanel) {
        a11yPanel.classList.toggle('active');
    } else {
        console.log("BŁĄD: Nie znaleziono panelu w HTML!");
    }
}


// Tymczasowa funkcja do testowania wyszukiwarki
function tymczasowyPrzelacznik() {
    const logo = document.getElementById('main-logo');
    const searchBar = document.getElementById('top-search-bar');

    // Jeśli logo jest widoczne -> schowaj logo, pokaż szukajkę
    if (logo.style.display !== 'none') {
        logo.style.display = 'none';
        searchBar.style.display = 'flex';
    } 
    // Jeśli logo jest ukryte (pokazana szukajka) -> pokaż logo, schowaj szukajkę
    else {
        logo.style.display = 'block'; 
        searchBar.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
function toggleMenu() {
    const sideMenu = document.getElementById('side-menu');
    // Jeśli menu ma klasę 'active', to ją zabiera. Jeśli nie ma - dodaje.
    sideMenu.classList.toggle('active');
}

// WKLEJ TU SWOJE KLUCZE
const KICK_CLIENT_ID = '01KNY8PZDKESCEQMYVQB9PKZMQ';
const KICK_CLIENT_SECRET = '95c096b355705e671bf8a4f7464ffe0ade3b0acafc565b531bc1eb960066de48';

// Używamy tego proxy, bo najlepiej omija blokady
const PROXY = 'https://corsproxy.io/?'; 

let currentKickToken = null;

function initKickCell() {
    const kickCell = document.getElementById('kick-cell');
    if (!kickCell) return;

    kickCell.innerHTML = `
        <div style="padding: 10px; background: #0b0e0f; text-align: center; border-bottom: 1px solid #1a1e24;">
            <p style="color: #53fc18; font-size: 12px; margin: 0;">LIDER KATEGORII KICK</p>
            <div id="active-category-name" style="color: white; font-weight: bold;">👑 Topka Globalna</div>
        </div>
        <div id="kick-content" style="height: calc(100% - 63px); width: 100%;"></div>
    `;

    loadTopKickStream(""); 
}

// 2. FUNKCJA POBIERAJĄCA TOKEN
async function getKickToken(contentDiv) {
    contentDiv.innerHTML = `<div style="color: yellow; text-align: center; padding-top: 20px;">[Krok 1] Generowanie Tokenu Kick...</div>`;
    
    const response = await fetch(PROXY + encodeURIComponent('https://id.kick.com/oauth/token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: KICK_CLIENT_ID,
            client_secret: KICK_CLIENT_SECRET
        })
    });

    if (!response.ok) throw new Error(`Proxy/Kick odrzuciło Token! Kod: ${response.status}`);
    
    const data = await response.json();
    if (data.access_token) {
        currentKickToken = data.access_token;
        return currentKickToken;
    } else {
        throw new Error("Błędne klucze Client ID lub Secret.");
    }
}

// 3. GŁÓWNA FUNKCJA ŁADUJĄCA WIDEO
async function loadTopKickStream(categorySlug) {
    const contentDiv = document.getElementById('kick-content');
    const nameLabel = document.getElementById('active-category-name');
    if (!contentDiv) return;

    contentDiv.innerHTML = `<div style="color: #53fc18; text-align: center; padding-top: 20px;"><i class="fas fa-spinner fa-spin"></i> Inicjalizacja...</div>`;

    try {
        if (!currentKickToken) {
            await getKickToken(contentDiv);
        }

        contentDiv.innerHTML = `<div style="color: yellow; text-align: center; padding-top: 20px;">[Krok 2] Szukanie streamów...</div>`;

        let categoryId = null;
        let finalUrl = 'https://api.kick.com/public/v1/livestreams?limit=1';

        // Jeśli szukamy konkretnej gry (z paska Steam)
        if (categorySlug && categorySlug !== "") {
            nameLabel.innerText = "Szukam kategorii...";

            // 1. Czyścimy nazwę ze Steama
            let cleanName = categorySlug.replace(/[™®]/g, '').trim();

            // 2. Pytamy Kicka o ID gry (poprawiony URL: name= zamiast name[]=)
            const catUrl = `https://api.kick.com/public/v2/categories?name=${encodeURIComponent(cleanName)}`;
            const catRes = await fetch(PROXY + encodeURIComponent(catUrl), {
                headers: { 
                    'Authorization': `Bearer ${currentKickToken}`,
                    'Accept': 'application/json' 
                }
            });

            if (catRes.status === 401 || catRes.status === 403) {
                currentKickToken = null; // Resetujemy token, żeby przy kolejnym kliknięciu pobrał nowy
                throw new Error("Token wygasł! Kliknij grę jeszcze raz.");
            }
            if (!catRes.ok) throw new Error("Błąd łączenia z Kick API.");
            
            const catData = await catRes.json();
            const categories = catData.data || catData;

            
            let matchedCategory = null;
            if (categories && categories.length > 0) {
                // Szukamy w liście zwróconej przez Kicka gry, której nazwa pasuje do tego, czego szukaliśmy
                matchedCategory = categories.find(c => 
                    c.name.toLowerCase().includes(cleanName.toLowerCase()) || 
                    cleanName.toLowerCase().includes(c.name.toLowerCase())
                );
                
                
                if (!matchedCategory && categories[0].slug !== "apex-legends") {
                    matchedCategory = categories[0];
                }
            }

            if (matchedCategory) {
                categoryId = matchedCategory.id;
                nameLabel.innerText = matchedCategory.name;
                finalUrl = `https://api.kick.com/public/v1/livestreams?category_id=${categoryId}&limit=1`;
            } else {
                throw new Error("Ta gra nie istnieje na Kicku (albo nikt w nią teraz nie gra).");
            }
        } else {
            nameLabel.innerText = "👑 Topka Globalna";
        }

        contentDiv.innerHTML = `<div style="color: yellow; text-align: center; padding-top: 20px;">[Krok 3] Renderowanie wideo...</div>`;

        const streamRes = await fetch(PROXY + encodeURIComponent(finalUrl), {
            headers: { 'Authorization': `Bearer ${currentKickToken}`, 'Accept': 'application/json' }
        });

        if (!streamRes.ok) throw new Error("Nie udało się pobrać wideo.");

        const streamData = await streamRes.json();
        const stream = streamData.data && streamData.data[0] ? streamData.data[0] : null;

        if (stream) {
            const streamer = stream.slug || (stream.channel && stream.channel.slug);
            const viewers = stream.viewer_count || stream.viewers || 0;
            const categoryName = stream.category ? stream.category.name : (categorySlug || "Kick Stream");

            contentDiv.innerHTML = `
                <div class="kick-embed-wrapper" style="height: 100%; display: flex; flex-direction: column;">
                    <div style="flex-grow: 1; position: relative;">
                         <iframe class="kick-frame" src="https://player.kick.com/${streamer}?muted=true&autoplay=true" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
                    </div>
                    <div class="kick-embed-info" style="padding: 15px; background: #171a21; border-top: 1px solid #2a475e;">
                        <span style="background: #53fc18; color: black; padding: 2px 8px; font-weight: bold;">🔴 LIVE</span>
                        <span style="margin-left: 10px; color: #53fc18;">${Number(viewers).toLocaleString()} widzów</span>
                        <h3 style="margin: 5px 0; color: white;">${streamer}</h3>
                        <p style="margin: 0; font-size: 13px; color: #8f98a0;">${categoryName}</p>
                    </div>
                </div>
            `;
        } else {
            throw new Error("Brak streamów dla tej gry.");
        }
    } catch (error) {
        console.error('BŁĄD APLIKACJI:', error);
        contentDiv.innerHTML = `
            <div style="color: #ff4444; text-align: center; padding-top: 30px;">
                <p>🛑 ${error.message}</p>
            </div>`;
    }
}

// 4. Odpalenie całości gdy strona się załaduje
document.addEventListener('DOMContentLoaded', initKickCell);


document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('game-search-input');
    const suggestionsBox = document.getElementById('search-suggestions');

    if (!searchInput || !suggestionsBox) return;

    let timeoutId;
    
  
    const STEAM_PROXY = 'https://corsproxy.io/?';

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        suggestionsBox.innerHTML = ''; 

        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(async () => {
            try {
                suggestionsBox.innerHTML = '<div style="padding: 10px; color: #8f98a0; text-align: center;"><i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Szukam na Steam...</div>';
                suggestionsBox.style.display = 'block';

                const steamApiUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=polish&cc=PL`;
                
                // Uderzamy przez corsproxy
                const response = await fetch(STEAM_PROXY + encodeURIComponent(steamApiUrl));
                
                if (!response.ok) throw new Error("Błąd proxy Steama");
                
                const data = await response.json();

                suggestionsBox.innerHTML = '';

                if (data.items && data.items.length > 0) {
                    data.items.forEach(game => {
                        const item = document.createElement('div');
                        item.className = 'suggestion-item';
                        
                        item.innerHTML = `
                            <img src="${game.tiny_image}" class="suggestion-img" onerror="this.src='https://via.placeholder.com/80x35/101214/ffffff?text=GRA'">
                            <span class="suggestion-text">${game.name}</span>
                        `;
                        
                        item.onclick = () => {
                            searchInput.value = game.name;
                            suggestionsBox.style.display = 'none';
                            
                            
                            if (typeof loadTopKickStream === "function") {
                                loadTopKickStream(game.name);
                            }
                        };
                        suggestionsBox.appendChild(item);
                    });
                } else {
                    suggestionsBox.innerHTML = '<div style="padding: 10px; color: #8f98a0; text-align: center;">Nie znaleziono gry na Steam.</div>';
                }

            } catch (error) {
                console.error("Szczegóły błędu Steam:", error);
                suggestionsBox.innerHTML = '<div style="padding: 10px; color: #ff4444; text-align: center;">Błąd połączenia ze Steam.</div>';
            }
        }, 500); 
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
});

function refhome() {
    window.location.href = 'Index.html';
}

// ==========================================
// 3. EASTER EGG - CZYSTE ZDJĘCIE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const footerCat = document.getElementById('footer-cat');
    const secretEgg = document.getElementById('secret-egg'); 
    
    if (!footerCat || !secretEgg) return;

    let clickCount = 0;
    let resetTimer;

    footerCat.addEventListener('click', () => {
        clickCount++;
        
        // Kotek rośnie przy klikaniu
        footerCat.style.transform = `scale(${1 + clickCount * 0.2})`;
        clearTimeout(resetTimer);

        if (clickCount >= 5) {
            // Po 5 kliknięciach: reset kota
            footerCat.style.transform = 'scale(1)';
            clickCount = 0;
            
            // Pokazujemy zdjęcie na cały ekran
            secretEgg.classList.remove('hidden');

            // Chowamy po 5 sekundach
            setTimeout(() => {
                secretEgg.classList.add('hidden');
            }, 5000);
            
        } else {
            // Reset liczników po 2 sekundach bezczynności
            resetTimer = setTimeout(() => {
                clickCount = 0;
                footerCat.style.transform = 'scale(1)';
            }, 2000);
        }
    });
});
