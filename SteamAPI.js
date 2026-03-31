const apiKey = 'YOUR_STEAM_API_KEY_HERE'; // <-- Wstaw swój klucz API Steam
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

// 4. AUTOMATYCZNE LOGOWANIE: Sprawdzanie przy starcie strony
window.onload = async function() {
    const zapamietaneID = localStorage.getItem('zapisaneSteamID');
    if (zapamietaneID) {
        console.log("Znaleziono zapisane ID:", zapamietaneID);
        await wyswietlProfil(zapamietaneID);
    }
};
function wyloguj() {
    localStorage.removeItem('zapisaneSteamID');
    location.reload();
}
