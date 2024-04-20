const axios = require("axios");
const cheerio = require("cheerio");
const TeamGraph = require("../TeamClass.js");
axios.get("https://footystats.org/england/premier-league#").then(({ data }) => {
  const $ = cheerio.load(data);

  const teams = $("table.full-league-table tr")
    .map((_, team) => {
      const $team = $(team);
      const name = $team.find("td.team.borderRightContent").text();
      const goal = $team.find("td.gf").text();
      const goalConceded = $team.find("td.ga").text();
      return { name: name, goal: goal, goalConceded: goalConceded };
    })
    .toArray();

  //pop unrelatived elements
  teams.shift();
  // for (let i = 0; i < teams.length; i++) {
  //   if (teams[i].position == "") {
  //     teams.splice(i, 1);
  //   }
  // }
  console.log(teams);
  let teamsGraph = new TeamGraph();
});
