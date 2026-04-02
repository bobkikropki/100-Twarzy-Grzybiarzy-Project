const apiKey = ''; // <-- Wstaw swój klucz API Steam
const proxyUrl = 'https://corsproxy.io/?';

// 1. Funkcja pomocnicza: Zamiana dowolnego linku Steam na SteamID64
async function wyciagnijSteamID(link) {
    const cleanLink = link.replace(/\/$/, "");
    const parts = cleanLink.split('/');
    const lastPart = parts.pop();

    if (cleanLink.includes('/id/')) {
        const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${lastPart}`;
        const response = await fetch(proxyUrl + encodeURIComponent(resolveUrl));
        const data = await response.json();

        if (data.response.success === 1) {
            return data.response.steamid;
        } else {
            throw new Error("Nie znaleziono użytkownika o takiej nazwie.");
        }
    } else if (cleanLink.includes('/profiles/')) {
        return lastPart;
    } else {
        throw new Error("Błędny format linku. Wklej pełny adres profilu Steam.");
    }
}

// 2. Funkcja wyświetlająca dane na stronie (Avatar + Tekst)
async function wyswietlProfil(steamId) {
    try {
        const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
        const response = await fetch(proxyUrl + encodeURIComponent(summaryUrl));
        const data = await response.json();
        const gracz = data.response.players[0];

        if (gracz) {
            // Podmiana awatara w kółku na górnym pasku (Metoda innerHTML)
            const container = document.getElementById('userAvatarContainer');
            if (container) {
                container.innerHTML = `
                    <img src="${gracz.avatarfull}" 
                         style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">
                `;
            }

            // Aktualizacja tekstów powitalnych
            const welcomeText = document.getElementById('WelcomeText');
            if (welcomeText) welcomeText.innerText = `Welcome, ${gracz.personaname}!`;
            

            // Zapisujemy ID w pamięci przeglądarki (Ciasteczko/LocalStorage)
            localStorage.setItem('zapisaneSteamID', steamId);
            
        }
        await pobierzIGrafikiGier(steamId);
    } catch (error) {
        console.error("Błąd podczas pobierania danych profilu:", error);
    }
}

// 3. Główna funkcja wywoływana przyciskiem "Login"
async function pokazDaneGracza() {
    const inputLink = document.getElementById('steamInput').value;
    
    if (!inputLink) {
        alert("Proszę wkleić link do profilu!");
        return;
    }

    try {
        const steamId = await wyciagnijSteamID(inputLink);
        await wyswietlProfil(steamId);
    } catch (error) {
        alert(error.message);
    }
}
async function pobierzIGrafikiGier(steamId) {
    try {
        const gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&format=json`;
        const response = await fetch(proxyUrl + encodeURIComponent(gamesUrl));
        const data = await response.json();

        if (data.response && data.response.games) {
            // Sortujemy po czasie gry
            const gry = data.response.games.sort((a, b) => b.playtime_forever - a.playtime_forever);
            
            // Łapiemy wszystkie buttony w prawej kolumnie
            const przyciski = document.querySelectorAll('.rightcol button');

            gry.slice(0, przyciski.length).forEach((gra, index) => {
                const btn = przyciski[index];
                    if (btn) {
                        // Używamy dokładnie tego formatu, który podałeś (małe x!)
                        const imageUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${gra.appid}/library_600x900.jpg`;
        
                        btn.style.backgroundImage = 'none'; // Czyścimy stare tło

                        // Wstawiamy strukturę z obrazkiem
                        btn.innerHTML = `
                            <img src="${imageUrl}" class="btn-img" onerror="this.src='https://community.cloudflare.steamstatic.com/public/images/applications/store/header_placeholder.png'">
                            <span class="btn-text">${gra.name}</span>
                        `;
                        btn.onclick = () => Showstats(gra.appid, gra.name, gra.playtime_forever);
                 }
            });
        }
    } catch (error) {
        console.error("Błąd pobierania gier:", error);
    }
}
async function Showstats(appId, gameName, playtime) {

    const content = document.querySelector('.leftcol-content');
    const steamId = localStorage.getItem('zapisaneSteamID');
    
    // Wyświetlamy ładowanie, żeby użytkownik wiedział, że coś się dzieje
    content.innerHTML = `<p>Ładowanie statystyk dla ${gameName}...</p>`;

    try {

        const statsUrl = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${apiKey}&steamid=${steamId}&appid=${appId}`;
        const response = await fetch(proxyUrl + encodeURIComponent(statsUrl));
        const data = await response.json();

        let statsHTML = `<h3>${gameName}</h3>`;
        statsHTML += `<p>Czas w grze: <strong>${Math.round(playtime / 60)}h</strong></p>`;

        if (data.playerstats && data.playerstats.achievements) {
            const achievements = data.playerstats.achievements;
            const unlocked = achievements.filter(a => a.achieved === 1).length;
            const percent = Math.round((unlocked / achievements.length) * 100);

            statsHTML += `
                <div class="stat-row">
                    <p>Osiągnięcia: <strong>${unlocked} / ${achievements.length}</strong> (${percent}%)</p>
                    <div style="background: #444; width: 100%; height: 10px; border-radius: 5px;">
                        <div style="background: #66c0f4; width: ${percent}%; height: 100%; border-radius: 5px;"></div>
                    </div>
                </div>
            `;
        } else {
            statsHTML += `<p style="color: #888;"><i>Brak dostępnych statystyk osiągnięć (profil może być prywatny).</i></p>`;
        }

        content.innerHTML = statsHTML;

    } catch (error) {
        content.innerHTML = `<p>Nie udało się pobrać szczegółowych statystyk dla tej gry.</p>`;
        console.error(error);
    }



}
// 4. AUTOMATYCZNE LOGOWANIE: Sprawdzanie przy starcie strony
window.onload = async function() {
    const zapamietaneID = localStorage.getItem('zapisaneSteamID');
    if (zapamietaneID) {
        console.log("Znaleziono zapisane ID:", zapamietaneID);
        await wyswietlProfil(zapamietaneID);
        await pobierzIGrafikiGier(zapamietaneID);
    }
};
function wyloguj() {
    localStorage.removeItem('zapisaneSteamID');
    location.reload();
}
