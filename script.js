

// build a Steam Web API URL given only the key and a SteamID 64-bit number
function makeSteamApiUrl(apiKey, steamId) {
  // formula: https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=YOURKEY&steamid=STEAMID&format=json
  // the caller just needs to supply their key and the 64‑bit SteamID of a user
  // this helper encodes the parameters and returns the full URL string
  return `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/` +
         `?key=${encodeURIComponent(apiKey)}` +
         `&steamid=${encodeURIComponent(steamId)}` +
         `&format=json`;
}

// helper to perform the API request and show result
function fetchOwnedGames(apiKey, steamId) {
  if (!apiKey || !steamId) {
    console.warn('API key or Steam ID missing');
    return;
  }

  const url = makeSteamApiUrl(apiKey, steamId);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('Owned games:', data);
      const demo = document.getElementById('demo');
      if (demo) demo.textContent = JSON.stringify(data, null, 2);
    })
    .catch(console.error);
}

// attempt to read the API key from a local text file and fill the input
function preloadApiKey() {
  fetch('SteamKey.txt')
    .then(r => r.text())
    .then(text => {
      const keyInput = document.getElementById('apiKey');
      if (keyInput && text.trim()) {
        keyInput.value = text.trim();
      }
    })
    .catch(() => {
      // ignore errors; file may not exist in production
    });
}

// wire up button if present
const loadBtn = document.getElementById('loadButton');
if (loadBtn) {
  loadBtn.addEventListener('click', () => {
    const keyInput = document.getElementById('apiKey');
    const idInput = document.getElementById('steamId');
    const key = keyInput ? keyInput.value.trim() : '';
    const id = idInput ? idInput.value.trim() : '';
    fetchOwnedGames(key, id);
  });
}

// preload key on startup
preloadApiKey();

// update DOM greeting
const demoElem = document.getElementById("demo");
if (demoElem) {
  demoElem.innerHTML = "Hello, JavaScript!";
}