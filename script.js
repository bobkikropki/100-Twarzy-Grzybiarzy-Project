function dropDownList() {
    document.getElementById("myDropdown").classList.toggle("show");
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
// Nasza baza do wyszukiwarki gier
const kickCategories = [
    { name: "👑 Topka Globalna (Wszyscy)", slug: "" },
    { name: "💬 Just Chatting", slug: "just-chatting" },
    { name: "🔫 CS 2", slug: "counter-strike-2" },
    { name: "🚗 GTA V / RP", slug: "grand-theft-auto-v" },
    { name: "🎰 Slots / Kasyno", slug: "slots" },
    { name: "IRL", slug: "irl" }
];

async function loadTopKickStream(categorySlug = "") {
    const kickCell = document.getElementById('kick-cell');
    if (!kickCell) return;

    const selectHTML = `
        <select class="kick-search-bar" onchange="loadTopKickStream(this.value)">
            ${kickCategories.map(cat => 
                `<option value="${cat.slug}" ${cat.slug === categorySlug ? 'selected' : ''}>${cat.name}</option>`
            ).join('')}
        </select>
    `;

    kickCell.innerHTML = selectHTML + `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; background: #0b0e0f;">
            <div class="kick-loading" style="color: #53fc18;">Łączenie z serwerem i filtrowanie...</div>
        </div>
    `;

    try {
        let localApiUrl = `http://localhost:3000/api/kick-stream`;
        if (categorySlug !== "") {
            localApiUrl += `?category=${categorySlug}`;
        }

        const response = await fetch(localApiUrl);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Rozpakowujemy listę streamów
        let streams = [];
        if (Array.isArray(data)) {
            streams = data;
        } else if (data && data.data && Array.isArray(data.data)) {
            streams = data.data; 
        } else if (data && data.livestreams && Array.isArray(data.livestreams)) {
            streams = data.livestreams;
        }

        // 🔥 NOWOŚĆ: Ręczne filtrowanie po naszej stronie!
        if (categorySlug !== "") {
            streams = streams.filter(stream => {
                let currentSlug = "";
                // Sprawdzamy, jak nowe API nazywa ścieżkę do gry streamera
                if (stream.category && stream.category.slug) {
                    currentSlug = stream.category.slug;
                } else if (stream.categories && stream.categories.length > 0) {
                    currentSlug = stream.categories[0].slug;
                }
                
                // Zostawiamy tylko tych, którzy grają w to, co wybrałeś
                return currentSlug === categorySlug;
            });
        }

        if (streams.length > 0) {
            // Po przefiltrowaniu bierzemy absolutnego lidera z tej jednej kategorii
            const topStream = streams[0]; 
            const streamerName = topStream.channel ? topStream.channel.slug : (topStream.slug || "Nieznany");
            const viewers = topStream.viewers || topStream.viewer_count || 0;
            
            let categoryName = "Brak kategorii";
            if (topStream.category && topStream.category.name) {
                categoryName = topStream.category.name;
            } else if (topStream.categories && topStream.categories.length > 0) {
                categoryName = topStream.categories[0].name;
            }

            kickCell.innerHTML = selectHTML + `
                <div class="kick-embed-wrapper">
                    <iframe
                        class="kick-frame"
                        src="https://player.kick.com/${streamerName}?muted=true&autoplay=true"
                        allowfullscreen>
                    </iframe>
                    <div class="kick-embed-info">
                        <span class="kick-status" style="background-color: #53fc18; color: #000;">🔴 LIVE • ${Number(viewers).toLocaleString('pl-PL')} widzów</span>
                        <h3>${streamerName}</h3>
                        <p>${categoryName}</p>
                    </div>
                </div>
            `;
        } else {
            // Jeśli żaden stream z ogólnej Topki nie pasuje do Twojej gry
            kickCell.innerHTML = selectHTML + `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; background: #0b0e0f;">
                    <img src="pliki/zdjęcia/Kick-Logo.png" alt="Kick" style="width: 150px; opacity: 0.5;">
                    <p style="color: #cccccc; margin-top: 20px;">Wśród najpopularniejszych aktualnie nikt w to nie gra.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Błąd aplikacji:', error);
        kickCell.innerHTML = selectHTML + '<div class="kick-loading" style="color: red; padding-top: 100px;">Błąd komunikacji z serwerem.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => loadTopKickStream(""));