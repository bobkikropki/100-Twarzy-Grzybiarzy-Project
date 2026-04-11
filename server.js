const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// Twoje dane z panelu developera
const CLIENT_ID = '01KNY8PZDKESCEQMYVQB9PKZMQ'; 
const CLIENT_SECRET = '95c096b355705e671bf8a4f7464ffe0ade3b0acafc565b531bc1eb960066de48'; 

app.get('/api/kick-stream', async (req, res) => {
    const category = req.query.category || '';
    let kickUrl = 'https://api.kick.com/public/v1/livestreams';
    if (category) {
        kickUrl += `?subcategory=${category}`;
    }

    try {
        console.log("🎫 1. Idę do kasy biletowej Kicka (id.kick.com) po Token Dostępu...");
        
        // KROK 1: Pukamy do właściwego serwera ID Kicka!
        const tokenResponse = await fetch('https://id.kick.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            console.error("❌ Odrzucono w kasie:", errText);
            return res.status(401).json({ error: "Błąd autoryzacji - Kick nas odrzucił!" });
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token; 
        console.log("✅ 2. Bilet (Token) zdobyty! Pobieram listę live'ów...");

        // KROK 2: Uderzamy do API z naszym Tokenem (Biletem)
        const response = await fetch(kickUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Kick odrzucił zapytanie o streamy: ${response.status}`);
        }

        const data = await response.json();
        console.log("🎉 3. Sukces! Dane wysłane na stronę.");
        res.json(data);

    } catch (error) {
        console.error("Błąd serwera:", error.message);
        res.status(500).json({ error: "Nie udało się pobrać danych z Kicka" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Twój prywatny serwer działa na: http://localhost:${PORT}`);
});