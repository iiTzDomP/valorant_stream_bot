const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.HENRIK_API_KEY;
const REGION = "eu";
const NAME = "NHS iiTzDømP";
const TAG = "A38Y";

app.get("/", async (req, res) => {
  try {
    const mmrResponse = await fetch(
      `https://api.henrikdev.xyz/valorant/v2/mmr/${REGION}/${encodeURIComponent(NAME)}/${TAG}`,
      { headers: { Authorization: API_KEY } }
    );

    const mmrData = await mmrResponse.json();

    if (!mmrData.data || !mmrData.data.current_data) {
      return res.send("Rank aktuell nicht verfügbar 😢");
    }

    const current = mmrData.data.current_data;

    const rank = current.currenttierpatched;
    const rr = current.ranking_in_tier;

      // ===== MATCHES FÜR HEUTE (MMR ENDPOINT) =====
      /*let winsToday = 0;
      let lossesToday = 0;

      const matchResponse = await fetch(
        `https://api.henrikdev.xyz/valorant/v3/matches/mmr/${REGION}/${encodeURIComponent(NAME)}/${TAG}?mode=competitive&size=10`,
        { headers: { Authorization: API_KEY } }
      );

      const matchData = await matchResponse.json();

      const today = new Date().toDateString();

      if (matchData.data && Array.isArray(matchData.data)) {
        for (const match of matchData.data) {

          if (!match.metadata?.game_start) continue;

          const matchDate = new Date(match.metadata.game_start * 1000).toDateString();
          if (matchDate !== today) continue;

          if (!Array.isArray(match.players)) continue;

          const normalize = (str) =>
            str?.normalize("NFKD").toLowerCase();

          const player = match.players.find(
            p =>
              normalize(p.name) === normalize(NAME) &&
              normalize(p.tag) === normalize(TAG)
          );
          
          if (!player) continue;

          const rrChange = player.mmr_change_to_last_game;

          if (typeof rrChange === "number") {
            if (rrChange > 0) winsToday++;
            if (rrChange < 0) lossesToday++;
          }
        }
      }
*/
    // ===== MATCHES FÜR HEUTE =====
let winsToday = 0;
let lossesToday = 0;

const matchResponse = await fetch(
  `https://api.henrikdev.xyz/valorant/v3/matches/${REGION}/${encodeURIComponent(NAME)}/${TAG}?mode=competitive&size=10`,
  { headers: { Authorization: API_KEY } }
);

const matchData = await matchResponse.json();

const today = new Date().toDateString();

if (matchData.data && Array.isArray(matchData.data)) {
  for (const match of matchData.data) {

    if (!match.metadata?.game_start) continue;

    const matchDate = new Date(match.metadata.game_start * 1000).toDateString();
    if (matchDate !== today) continue;

    // Spieler finden
    const player = match.players?.all_players?.find(
      p => p.name === NAME && p.tag === TAG
    );

    if (!player) continue;

    const playerTeam = player.team; // "Red" oder "Blue"

    const didWin = match.teams[playerTeam.toLowerCase()]?.has_won;

    if (didWin === true) winsToday++;
    if (didWin === false) lossesToday++;
  }
}
    // Placement nur wenn vorhanden
    let placement = "";
    if (current.leaderboard_placement) {
      placement = ` | Platz: #${current.leaderboard_placement}`;
    }

    res.send(
      `${NAME} ist ${rank}: ${rr} RR${placement}`
    );

  } catch (err) {
    console.error("ERROR:", err);
    res.send("Fehler beim Abrufen des Ranks 😢");
  }
});


app.listen(PORT, () => {
  console.log("Server läuft auf Port", PORT);
});

