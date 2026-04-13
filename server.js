const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// TWOJE OFICJALNE KLUCZE KICKA
const CLIENT_ID = ''; 
const CLIENT_SECRET = ''; 

// Mapa dla serwera, żeby wiedział, jak Kick oficjalnie nazywa gry, by zdobyć ich numeryczne ID
const categoryNamesMap = {
    'just-chatting': 'Just Chatting',
    'counter-strike-2': 'Counter-Strike 2',
    'grand-theft-auto-v': 'Grand Theft Auto V',
    'slots': 'Slots & Casino',
    'irl': 'IRL'
};

app.get('/api/kick-stream', async (req, res) => {
    let categorySlug = req.query.category || '';

    try {
        console.log(`🎫 1. Logowanie do Kicka...`);
        const tokenResponse = await fetch('https://id.kick.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        if (!tokenResponse.ok) throw new Error("Błąd tokenu");
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token; 
        
        let targetCategoryId = null;

        // KROK 2: Jeśli wybrano grę, pobieramy jej NUMERYCZNE ID (Z Twojego drugiego screena!)
        if (categorySlug !== "") {
            const exactName = categoryNamesMap[categorySlug] || categorySlug;
            console.log(`🔍 2. Szukam ID dla gry: ${exactName}...`);
            
            const catResponse = await fetch(`https://api.kick.com/public/v2/categories?name=${encodeURIComponent(exactName)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`, 
                    'Accept': 'application/json'
                }
            });
            
            if (catResponse.ok) {
                const catData = await catResponse.json();
                if (catData && catData.data && catData.data.length > 0) {
                    targetCategoryId = catData.data[0].id;
                    console.log(`✅ ID znalezione: ${targetCategoryId}`);
                }
            }
        }

        console.log(`✅ 3. Pytam o streamy po prawidłowym ID: ${targetCategoryId || "Brak (Topka Globalna)"}`);

        // KROK 3: Pytamy o streamy używając category_id (Z Twojego pierwszego screena!)
        // Ustawiamy limit=1, bo chcemy tylko absolutnego lidera!
        let kickUrl = 'https://api.kick.com/public/v1/livestreams?limit=1';
        
        if (targetCategoryId) {
            kickUrl += `&category_id=${targetCategoryId}`;
        }

        const response = await fetch(kickUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Kick odrzucił zapytanie o streamy: ${response.status}`);
        const data = await response.json();
        
        let streams = [];
        if (Array.isArray(data)) streams = data;
        else if (data && data.data && Array.isArray(data.data)) streams = data.data;

        if (streams.length > 0) {
            const winner = streams[0]; 
            const streamerName = winner.channel ? winner.channel.slug : (winner.slug || "Nieznany");
            const viewers = winner.viewers || winner.viewer_count || 0;
            
            let categoryName = "Wybrana Kategoria";
            if (winner.category && winner.category.name) {
                categoryName = winner.category.name;
            }

            console.log(`🎉 4. ZNALEZIONO LIDERA: ${streamerName} (${viewers} widzów)`);
            res.json({ success: true, streamer: streamerName, viewers: viewers, category: categoryName });
        } else {
            console.log(`❌ 4. Pusto. Nikt na Kicku w to teraz nie gra.`);
            res.json({ success: false, message: "Brak streamów" });
        }

    } catch (error) {
        console.error("Błąd serwera:", error.message);
        res.status(500).json({ error: "Błąd z API Kicka" });
    }
});


// --- NOWOŚĆ: MOST DO WYSZUKIWARKI SKLEPU STEAM ---
app.get('/api/steam-search', async (req, res) => {
    const term = req.query.term || '';
    
    try {
        // Pytamy oficjalny sklep Steam o grę
        const steamUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=polish&cc=PL`;
        
        const response = await fetch(steamUrl);
        if (!response.ok) throw new Error("Steam odrzucił zapytanie");
        
        const data = await response.json();
        
        // Odsyłamy gry z powrotem do Twojej strony
        res.json(data);
    } catch (error) {
        console.error("Błąd wyszukiwania Steam:", error.message);
        res.status(500).json({ error: "Błąd wyszukiwania w bazie Steam" });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Perfekcyjny Serwer Kick działa na: http://localhost:${PORT}`);
});
// --- NOWOŚĆ: MOST DO WYSZUKIWARKI SKLEPU STEAM ---
app.get('/api/steam-search', async (req, res) => {
    const term = req.query.term || '';
    
    try {
        // Pytamy oficjalny sklep Steam o grę (zwraca wyniki po polsku)
        const steamUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=polish&cc=PL`;
        
        const response = await fetch(steamUrl);
        if (!response.ok) throw new Error("Steam odrzucił zapytanie");
        
        const data = await response.json();
        
        // Zwracamy paczkę gier do Twojej strony internetowej
        res.json(data);
    } catch (error) {
        console.error("Błąd wyszukiwania Steam:", error.message);
        res.status(500).json({ error: "Błąd wyszukiwania w bazie Steam" });
    }
});