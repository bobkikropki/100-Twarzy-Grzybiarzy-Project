const apiKey = "";
const proxyUrl = 'https://corsproxy.io/?';
async function getID() 
{
  const link = document.getElementById('steamInput').value;
  //wyciąga SteamID z linku, trust
  const steamId = link.split('/').filter(Boolean).pop();
  const apiUrl =
   `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;

   try
   {
      const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
      const data = await response.json();
      const gracz = data.response.players[0];
      if (gracz) {
        document.getElementById('result').innerHTML= `<h3>Witaj, 
                ${gracz.personaname}!</h3>
                <img src="${gracz.avatarfull}" alt="Avatar">
            `;

      } else {
        alert("Nie znaleziono gracza. Upewnij się, że profil jest publiczny!");
      }
   }
     catch (error) {
    console.error("Błąd:", error);
  }
  }

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