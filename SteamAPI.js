const apiKey = '';
const proxyUrl = 'https://corsproxy.io/?';

async function wyciagnijSteamID(link) {
    // Czyścimy link z ukośników na końcu
    const cleanLink = link.replace(/\/$/, "");
    const parts = cleanLink.split('/');
    const lastPart = parts.pop(); // To będzie albo numer, albo nazwa

    // Sprawdzamy czy link zawiera "/id/" (czyli nazwę użytkownika)
    if (cleanLink.includes('/id/')) {
        const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${lastPart}`;
        
        const response = await fetch(proxyUrl + encodeURIComponent(resolveUrl));
        const data = await response.json();

        if (data.response.success === 1) {
            return data.response.steamid; // Zwraca 7656119...
        } else {
            throw new Error("Nie znaleziono użytkownika o takiej nazwie.");
        }
    } 
    // Jeśli link zawiera "/profiles/", to lastPart jest już naszym ID
    else if (cleanLink.includes('/profiles/')) {
        return lastPart;
    } 
    else {
        throw new Error("Błędny format linku Steam.");
    }
}
async function pokazDaneGracza() {
    const inputLink = document.getElementById('steamInput').value;
    
    try {
        // KROK 1: Zamień link na SteamID
        const steamId = await wyciagnijSteamID(inputLink);
        console.log("Znalezione ID:", steamId);

        // KROK 2: Pobierz dane profilu (jak w poprzednim kroku)
        const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
        const response = await fetch(proxyUrl + encodeURIComponent(summaryUrl));
        const data = await response.json();
        
        // Wyświetl na stronie...
        const gracz = data.response.players[0];
        document.getElementById('wynik').innerText = `Witaj, ${gracz.personaname}! Twoje ID to: ${steamId}`;

    } catch (error) {
        alert(error.message);
    }
}