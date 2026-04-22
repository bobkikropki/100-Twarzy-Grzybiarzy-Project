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
// Funkcja do wysuwania i chowania bocznego menu
function toggleMenu() {
    const sideMenu = document.getElementById('side-menu');
    // Jeśli menu ma klasę 'active', to ją zabiera. Jeśli nie ma - dodaje.
    sideMenu.classList.toggle('active');
}
const kickCategories = [
    { name: "👑 Topka Globalna (Wszyscy)", slug: "" },
    { name: "💬 Just Chatting", slug: "just-chatting" },
    { name: "🔫 CS 2", slug: "counter-strike-2" },
    { name: "🚗 GTA V / RP", slug: "grand-theft-auto-v" },
    { name: "🎰 Slots / Kasyno", slug: "slots" },
    { name: "IRL", slug: "irl" }
];

// 1. Zbudowanie Kafelka RAZ (żeby lista się nie psuła)
function initKickCell() {
    const kickCell = document.getElementById('kick-cell');
    if (!kickCell) return;

    // Górny pasek z wyborem (niezmienny) + Dolny pusty "telewizor" na wideo
    kickCell.innerHTML = `
        <div style="padding: 10px; background: #0b0e0f; text-align: center; border-bottom: 1px solid #1a1e24;">
            <select id="kick-dropdown" class="kick-search-bar" onchange="loadTopKickStream(this.value)" 
                    style="padding: 8px 15px; background: #171a21; color: white; border: 1px solid #53fc18; border-radius: 4px; outline: none; cursor: pointer;">
                ${kickCategories.map(cat => `<option value="${cat.slug}">${cat.name}</option>`).join('')}
            </select>
        </div>
        <div id="kick-content" style="height: calc(100% - 53px); width: 100%;"></div>
    `;

    // Na start ładujemy domyślną pustą kategorię (czyli Topkę)
    loadTopKickStream("");
}

// 2. Ładowanie i podmienianie TYLKO samego wideo
async function loadTopKickStream(categorySlug) {
    const contentDiv = document.getElementById('kick-content');
    if (!contentDiv) return;

    // Ekran ładowania w samym telewizorze
    contentDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; background: #0b0e0f;">
            <div class="kick-loading" style="color: #53fc18;">Uzgadnianie Tokenu API...</div>
        </div>
    `;

    try {
        let localApiUrl = `http://localhost:3000/api/kick-stream`;
        if (categorySlug !== "") {
            localApiUrl += `?category=${categorySlug}`;
        }

        const response = await fetch(localApiUrl);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        if (data.success) {
            // Serwer dał nam lidera, włączamy wideo
            contentDiv.innerHTML = `
                <div class="kick-embed-wrapper" style="height: 100%;">
                    <iframe
                        class="kick-frame"
                        src="https://player.kick.com/${data.streamer}?muted=true&autoplay=true"
                        allowfullscreen>
                    </iframe>
                    <div class="kick-embed-info">
                        <span class="kick-status" style="background-color: #53fc18; color: #000;">🔴 LIVE • ${Number(data.viewers).toLocaleString('pl-PL')} widzów</span>
                        <h3>${data.streamer}</h3>
                        <p>${data.category}</p>
                    </div>
                </div>
            `;
        } else {
            // Jeśli żaden stream z ogólnej Topki z API Kicka nie pasuje do Twojej gry
            contentDiv.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; background: #0b0e0f;">
                    <img src="pliki/zdjęcia/Kick-Logo.png" alt="Kick" style="width: 150px; opacity: 0.5;">
                    <p style="color: #cccccc; margin-top: 20px;">Wśród światowej czołówki nikt w to nie gra.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Błąd komunikacji:', error);
        contentDiv.innerHTML = '<div class="kick-loading" style="color: red; padding-top: 100px;">Twój serwer jest wyłączony!</div>';
    }
}

// Odpalamy budowę kafelka, gdy strona się załaduje
document.addEventListener('DOMContentLoaded', initKickCell);








// --- LOGIKA WYSZUKIWARKI GIER (POŁĄCZENIE ZE STEAM) ---
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('game-search-input');
    const suggestionsBox = document.getElementById('search-suggestions');

    if (!searchInput || !suggestionsBox) return;

    let timeoutId;

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        suggestionsBox.innerHTML = ''; // Czyszczenie listy

        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        clearTimeout(timeoutId);
        // Opóźnienie 300ms, żeby nie zapchać serwera przy bardzo szybkim pisaniu
        timeoutId = setTimeout(async () => {
            try {
                suggestionsBox.innerHTML = '<div style="padding: 10px; color: #8f98a0; text-align: center;">Szukam na Steam...</div>';
                suggestionsBox.style.display = 'block';

                // Odpytujemy nasz serwer Node.js, a on pyta Steama
                const response = await fetch(`http://localhost:3000/api/steam-search?term=${encodeURIComponent(query)}`);
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
                        
                        // Co się dzieje po kliknięciu w grę
                        item.onclick = () => {
                            searchInput.value = game.name;
                            suggestionsBox.style.display = 'none';
                            
                            // Zmiana formatu dla Kicka (np. "Counter-Strike 2" -> "counter-strike-2")
                            let kickSlug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            
                            if (typeof loadTopKickStream === "function") {
                                loadTopKickStream(kickSlug);
                            } else {
                                console.error("Błąd: Brak funkcji ładującej Kicka!");
                            }
                        };
                        suggestionsBox.appendChild(item);
                    });
                } else {
                    suggestionsBox.innerHTML = '<div style="padding: 10px; color: #8f98a0; text-align: center;">Nie znaleziono gry na Steam.</div>';
                }

            } catch (error) {
                console.error("Błąd:", error);
                suggestionsBox.innerHTML = '<div style="padding: 10px; color: red; text-align: center;">Błąd komunikacji z serwerem.</div>';
            }
        }, 300);
    });

    // Chowanie listy klikając w tło
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
});
function refhome() {
    window.location.href = 'Index.html';
}