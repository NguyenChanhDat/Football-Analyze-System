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

    return teamsName;  
  } catch (error) {
    console.error("Error scraping players' data:", error);
    return []; // Return an empty array in case of error
  }
}

(async () => {
  const teamsData = await scrapePlayersData();
  //console.log(teamsData); You can use playersData wherever you need it
  let teamsGraph = new TeamGraph();
  for (let i = 0; i < teamsData.length; i++) {
    teamsGraph.addTeam(teamsData[i]);
  }
  console.log(teamsGraph);
})();
