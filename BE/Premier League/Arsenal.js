const axios = require("axios");
const cheerio = require("cheerio");


// Function to scrape players' data
async function scrapePlayersData() {
  try {
    const { data } = await axios.get(
      "https://footystats.org/clubs/arsenal-fc-59#"
    );
    const $ = cheerio.load(data);

    const players = $("div.w94.rw100.cf.m0Auto")
      .map((_, player) => {
        const $player = $(player);
        const name = $player.find(".semi-bold").text();
        const position = $player.find(".col-lg-2.ac.fs09e").text();
        return { name: name, position: position };
      })
      .toArray();

    // Remove manager
    players.pop();

    // Remove elements with empty positions
    for (let i = 0; i < players.length; i++) {
      if (players[i].position == "") {
        players.splice(i, 1);
      }
    }
    return players; // Return the players array
  } catch (error) {
    console.error("Error scraping players' data:", error);
    return []; // Return an empty array in case of error
  }
}

// Usage example
(async () => {
  const playersData = await scrapePlayersData();
  console.log(playersData); // You can use playersData wherever you need it
})();
