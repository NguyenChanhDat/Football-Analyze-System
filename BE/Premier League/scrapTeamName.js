const axios = require("axios");
const cheerio = require("cheerio");
const TeamGraph = require("../TeamClass.js");

// Function to scrape players' data
async function scrapePlayersData() {
  try {
    const { data } = await axios.get(
      "https://www.foxsports.com/soccer/premier-league/teams"
    );
    const $ = cheerio.load(data);

    const teamsName = $(
      "a.entity-list-row-container.image-logo div.entity-list-row-content"
    )
      .map((_, teamsName) => {
        const $teamsName = $(teamsName);
        return $teamsName.text();
      })
      .toArray();

    return teamsName; // Return the teamsName array
  } catch (error) {
    console.error("Error scraping teams' data:", error);
    return []; // Return an empty array in case of error
  }
}

(async () => {
  const teamsData = await scrapePlayersData();
  let teamsGraph = new TeamGraph();
  for (let i = 0; i < teamsData.length; i++) {
    teamsGraph.addTeam(teamsData[i]);
  }

  for (var i in teamsGraph.teams) {
    console.log(teamsGraph.teams[i]);
  }
  // console.log(teamsGraph);
})();
