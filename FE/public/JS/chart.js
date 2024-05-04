const mysql = require("mysql");
// const bb = require("billboard.js");
const con = mysql.createPool({
  host: "localhost",
  user: "sqluser",
  password: "dat20112011",
  database: "epl",
});

async function fetchData() {
  return new Promise((resolve, reject) => {
    con.getConnection(function (err, connection) {
      if (err) {
        reject(err);
        return;
      }

      connection.query(
        "SELECT * FROM teamsMetrics ORDER BY points DESC, goal DESC LIMIT 10",
        function (err, queryResult, fields) {
          connection.release(); // Release the connection when done with it
          if (err) {
            reject(err);
            return;
          }

          let result = [];
          let teamName = [];
          let teamGoalPerMatch = [];
          let teamPointPerMatch = [];
          teamGoalPerMatch.push("Goal per Match");
          teamPointPerMatch.push("Point per Match");
          for (let i = 0; i < 10; i++) {
            teamName.push(queryResult[i].teamName);
            teamGoalPerMatch.push(
              (queryResult[i].goal / queryResult[i].matchplayed).toFixed(2)
            );
            teamPointPerMatch.push(
              (queryResult[i].points / queryResult[i].matchplayed).toFixed(2)
            );
          }
          result.push(teamName, teamGoalPerMatch, teamPointPerMatch);
          resolve(result);
        }
      );
    });
  });
}

fetchData()
  .then((response) => {
    
  })
  .catch((error) => {
    console.log(error);
  });
