

// helper to perform the API request and show result
function fetchOwnedGames(apiKey, steamId) {
  if (!apiKey || !steamId) {
    console.warn('API key or Steam ID missing');
    return;
  }

  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${encodeURIComponent(apiKey)}&steamid=${encodeURIComponent(steamId)}&format=json`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('Owned games:', data);
      const demo = document.getElementById('demo');
      if (demo) demo.textContent = JSON.stringify(data, null, 2);
    })
    .catch(console.error);
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

// update DOM greeting
const demoElem = document.getElementById("demo");
if (demoElem) {
  demoElem.innerHTML = "Hello, JavaScript!";
}