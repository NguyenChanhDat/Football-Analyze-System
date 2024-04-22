const axios = require("axios");
const cheerio = require("cheerio");
const TeamGraph = require("../TeamClass.js");
const mysql = require("mysql");
const con = mysql.createPool({
  host: "localhost",
  user: "sqluser",
  password: "dat20112011",
  database: "todolistdb",
});

axios.get("https://footystats.org/england/premier-league#").then(({ data }) => {
  const $ = cheerio.load(data);

  const teams = $("table.full-league-table tr")
    .map((_, team) => {
      const $team = $(team);
      const name = $team.find("td.team.borderRightContent").text();
      const matchplayed = $team.find("td.mp").text();
      const win = $team.find("td.win").text();
      const draw = $team.find("td.draw").text();
      const loss = $team.find("td.loss").text();
      const goal = $team.find("td.gf").text();
      const goalConceded = $team.find("td.ga").text();

      return {
        name: name,
        matchplayed: matchplayed,
        win: win,
        draw: draw,
        loss: loss,
        goal: goal,
        goalConceded: goalConceded,
      };
    })
    .toArray();

  //pop unrelatived elements
  teams.shift();
  // for (let i = 0; i < teams.length; i++) {
  //   if (teams[i].position == "") {
  //     teams.splice(i, 1);
  //   }
  // }
  // console.log(teams);
  let teamsGraph = new TeamGraph();
  for (let i = 0; i < teams.length; i++) {
    teamsGraph.addTeam(teams[i].name);
    teamsGraph.teams[teams[i].name].addMetric(
      "matchplayed",
      teams[i].matchplayed
    );
    teamsGraph.teams[teams[i].name].addMetric("win", teams[i].win);
    teamsGraph.teams[teams[i].name].addMetric("draw", teams[i].draw);
    teamsGraph.teams[teams[i].name].addMetric("loss", teams[i].loss);
    teamsGraph.teams[teams[i].name].addMetric("goal", teams[i].goal);
    teamsGraph.teams[teams[i].name].addMetric(
      "goalConceded",
      teams[i].goalConceded
    );
    teamsGraph.teams[teams[i].name].addMetric(
      "goalDifference",
      teams[i].goal - teams[i].goalConceded
    );
  }
  console.log(teamsGraph);
});
