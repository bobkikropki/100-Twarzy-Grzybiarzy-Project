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
            // Sortujemy po czasie gry (playtime_forever)
            const gry = data.response.games.sort((a, b) => b.playtime_forever - a.playtime_forever);
            
            // TU ZMIANA: Szukamy buttonów wewnątrz .rightcol
            const przyciski = document.querySelectorAll('.rightcol button');

            gry.slice(0, przyciski.length).forEach((gra, index) => {
                const btn = przyciski[index];
                if (btn) {
                    // Link do grafiki "header" (szeroka grafika gry)
                    const imageUrl = `https://steamcdn-a.akamaihd.net/steam/apps/${gra.appid}/header.jpg`;
                    
                    // Nakładamy przyciemnienie (linear-gradient), żeby biały tekst był widoczny
                    btn.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${imageUrl}')`;
                    btn.innerText = gra.name;
                }
                
            });
        }
    } catch (error) {
        console.error("Błąd pobierania gier:", error);
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
