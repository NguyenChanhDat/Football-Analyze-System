const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const mysql = require('mysql');
const con = mysql.createPool({
  host: 'localhost',
  user: 'sqluser',
  password: 'dat20112011',
  database: 'epl',
});
//Server is listening on port 8083
app.listen(8083, () => {
  console.log(`App listening at port 8083`);
});
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
  //__dirname : It will resolve to your project folder.
});
app.use('/', router);

// Setting EJS as the view engine
app.set('view engine', 'ejs');
app.set(
  'views',
  path.join(__dirname, '/public/NavBar Files/Teams Files/views')
);

//retrieve team's data for table sorting
app.get('/NavBar%20Files/Teams%20Files/table.html', (req, res) => {
  con.getConnection(function (err) {
    if (err) throw err;
    con.query(
      'SELECT * FROM teamsMetrics ORDER BY points DESC, goalDifference DESC, goal DESC, goalConceded ASC',
      function (err, result, fields) {
        if (err) throw err;
        let teams = [];
        for (let i = 0; i < result.length; i++) {
          teams.push({
            name: result[i].teamName,
            matchPlayed: result[i].matchplayed,
            win: result[i].win,
            draw: result[i].draw,
            loss: result[i].loss,
            goal: result[i].goal,
            goalConceded: result[i].goalConceded,
            points: result[i].points,
            goalDifference: result[i].goalDifference,
          });
        }
        res.render('table', { teams });
      }
    );
  });
});

//retrieve team's data for chart building
app.get('/NavBar%20Files/Teams%20Files/chart.html', (req, res) => {
  con.getConnection(function (err, connection) {
    if (err) {
      reject(err);
      return;
    }
    connection.query(
      'SELECT * FROM teamsMetrics ORDER BY points DESC, goal DESC LIMIT 10',
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
        let teamGoalConcededPerMatch = [];
        for (let i = 0; i < 10; i++) {
          teamName.push(queryResult[i].teamName);
          teamGoalPerMatch.push(
            (queryResult[i].goal / queryResult[i].matchplayed).toFixed(2)
          );
          teamPointPerMatch.push(
            (queryResult[i].points / queryResult[i].matchplayed).toFixed(2)
          );
          teamGoalConcededPerMatch.push(
            (queryResult[i].goalConceded / queryResult[i].matchplayed).toFixed(
              2
            )
          );
        }
        result.push(
          teamName,
          teamGoalPerMatch,
          teamPointPerMatch,
          teamGoalConcededPerMatch
        );
        // console.log(result);
        res.render('chart', { result });
      }
    );
  });
});
