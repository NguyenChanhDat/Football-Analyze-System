const axios = require("axios");
const cheerio = require("cheerio");
const TeamGraph = require("../TeamClass.js");

let teams = [
  "arsenal-fc",
  "liverpool-fc",
  "manchester-city-fc",
  "aston-villa-fc",
  "tottenham-hotspur-fc",
  "manchester-united-fc",
  "west-ham-fc",
  "brighton-hove-albion-fc",
  "wolverhampton-wanderers-fc",
  "newcastle-united-fc",
  "chelsea-fc",
  "fulham-fc",
  "afc-bournemouth",
  "crystal-palace-fc",
  "brentford-fc",
  "luton-town-fc",
  "everton-fc",
  "nottingham-forest-fc",
  "burnley-fc",
  "sheffield-united-fc",
];

for (let i = 0; i < teams.length; i++) {
  for (let j = 0; j < teams.length; j++) {
    if (j == i) {
      continue;
    }
    // Function to scrape teams' match
    async function scrapePlayersData() {
      try {
        const { data } = await axios.get(
          "https://footystats.org/england/" +
            teams[i] +
            "-vs-" +
            teams[j] +
            "-h2h-stats"
        );
        const $ = cheerio.load(data);

        const teamsMatches = $(
          "a.fixture.changeH2HDataButton_neo span"
        )
          .map((_, teamsMatches) => {
            const $teamsMatches = $(teamsMatches);
            return $teamsMatches.text();
          })
          .toArray();

        return teamsMatches; // Return the teamsName array
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
  }
}
