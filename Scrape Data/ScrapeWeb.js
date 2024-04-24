const axios = require("axios");
const cheerio = require("cheerio");
const TeamGraph = require("../Scrape Data/TeamClass");
const mysql = require("mysql");
const express = require("express");
const app = express();
const con = mysql.createPool({
  host: "localhost",
  user: "sqluser",
  password: "dat20112011",
  database: "epl",
});
app.listen(8085, () => {
  console.log(`App listening at port 8085`);
});
app.get("/", (req, res) => {
  axios
    .get("https://footystats.org/england/premier-league#")
    .then(({ data }) => {
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
          const points = $team.find("td.points.bold").text();
          return {
            name: name,
            matchplayed: matchplayed,
            win: win,
            draw: draw,
            loss: loss,
            goal: goal,
            goalConceded: goalConceded,
            points: points,
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
        teamsGraph.teams[i].addMetric("matchplayed", teams[i].matchplayed);
        teamsGraph.teams[i].addMetric("win", teams[i].win);
        teamsGraph.teams[i].addMetric("draw", teams[i].draw);
        teamsGraph.teams[i].addMetric("loss", teams[i].loss);
        teamsGraph.teams[i].addMetric("goal", teams[i].goal);
        teamsGraph.teams[i].addMetric("goalConceded", teams[i].goalConceded);
        teamsGraph.teams[i].addMetric(
          "goalDifference",
          teams[i].goal - teams[i].goalConceded
        );
        teamsGraph.teams[i].addMetric("points", teams[i].points);
      }

      con.getConnection(function (err, connection) {
        if (err) throw err;
        console.log("Connected!");
        for (let i = 0; i < teamsGraph.teams.length; i++) {
          connection.query(
            "DELETE * FROM teamsmetrics",
            // delete all
            function (err, result) {
              if (err) {
                connection.release(); // Release the connection if there's an error
                throw err;
              }
              connection.query(
                "INSERT INTO teamsmetrics (teamName, matchplayed, win, draw, loss, goal, goalConceded,goalDifference , points) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?)",
                [
                  teamsGraph.teams[i].name,
                  teamsGraph.teams[i].metrics.matchplayed,
                  teamsGraph.teams[i].metrics.win,
                  teamsGraph.teams[i].metrics.draw,
                  teamsGraph.teams[i].metrics.loss,
                  teamsGraph.teams[i].metrics.goal,
                  teamsGraph.teams[i].metrics.goalConceded,
                  teamsGraph.teams[i].metrics.goalDifference,
                  teamsGraph.teams[i].metrics.points,
                ], // Pass both todo and date values as an array
                function (err, result) {
                  if (err) {
                    connection.release(); // Release the connection if there's an error
                    throw err;
                  }
                  console.log("Data added to teamsmetrics in mySQL server!");
                }
              );
            }
          );
        }
      });
    });
});
