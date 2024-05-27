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

const bodyParser = require('body-parser');
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

//Server is listening on port 8083
app.listen(8083, () => {
  console.log(`App listening at port 8083`);
});
//static files
app.use(express.static(path.join(__dirname, 'public')));

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
        let teamAvgPossession = [];
        let teamGoalTotal = [];
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
          teamAvgPossession.push(queryResult[i].avgPossession);
          teamGoalTotal.push(queryResult[i].goal);
        }
        result.push(
          teamName,
          teamGoalPerMatch,
          teamPointPerMatch,
          teamGoalConcededPerMatch,
          teamAvgPossession,
          teamGoalTotal
        );
        // console.log(result);
        res.render('chart', { result });
      }
    );
  });
});

app.get('/NavBar%20Files/Teams%20Files/winRate.html', (req, res) => {
  console.log(req.query.firstTeam);
  console.log(req.query.secondTeam);
  let teamOne = req.query.firstTeam;
  let teamTwo = req.query.secondTeam;
  // // eliminate the FC from the clubs' name
  // //Exception for the damn Bournemouth :)))
  // if (req.query.firstTeam == 'AFC Bournemouth') {
  //   let teamOne = req.query.firstTeam.slice(3, req.query.firstTeam.length);
  //   let teamTwo = req.query.secondTeam.slice(
  //     0,
  //     req.query.secondTeamTeam.length - 2
  //   );
  // } else if (req.query.secondTeam == 'AFC Bournemouth') {
  //   let teamTwo = req.query.firstTeam.slice(3, req.query.firstTeam.length);
  //   let teamOne = req.query.secondTeam.slice(
  //     0,
  //     req.query.secondTeamTeam.length - 2
  //   );
  // } else {
  //   let teamOne = req.query.firstTeam.slice(0, req.query.firstTeam.length - 2);
  //   let teamTwo = req.query.secondTeam.slice(
  //     0,
  //     req.query.secondTeamTeam.length - 2
  //   );
  // }

  con.getConnection(function (err, connection) {
    if (err) {
      reject(err);
      return;
    }
    //retrieve data h2h between teams
    connection.query(
      'select *from h2h where ((homeTeam in(?,?)) and (awayTeam in(?,?)))',
      [teamOne, teamTwo, teamOne, teamTwo],
      function (err, queryResult, fields) {
        console.log(queryResult);
        let winLossArr = [];
        for (let i = 0; i < queryResult.length; i++) {
          if (
            (queryResult[i].homeTeam == teamOne ||
              queryResult[i].awayTeam == teamOne) &&
            queryResult[i].result.slice(0, 1) ==
              queryResult[i].result.slice(2, 3)
          ) {
            winLossArr.push(2); //2 mean a draw
          } else if (
            (queryResult[i].homeTeam == teamOne &&
              queryResult[i].result.slice(0, 1) >
                queryResult[i].result.slice(2, 3)) ||
            (queryResult[i].awayTeam == teamOne &&
              queryResult[i].result.slice(0, 1) <
                queryResult[i].result.slice(2, 3))
          ) {
            winLossArr.push(1); // 1 as teamOne win
          } else {
            winLossArr.push(0); //0 as teamTwo win
          }
        }

        //Cal winRate after each ROund
        let aWin = 0;
        let bWin = 0;
        let arrWinRateA = [];
        let arrWinRateB = [];

        for (let i = 0; i < winLossArr.length; i++) {
          if (winLossArr[i] == 1) {
            aWin++;
            arrWinRateA.push(((aWin / (i + 1)) * 100).toFixed(2));
            arrWinRateB.push(((bWin / (i + 1)) * 100).toFixed(2));
          } else if (winLossArr[i] == 0) {
            bWin++;
            arrWinRateB.push(((bWin / (i + 1)) * 100).toFixed(2));
            arrWinRateA.push(((aWin / (i + 1)) * 100).toFixed(2));
          } else {
            arrWinRateA.push(((aWin / (i + 1)) * 100).toFixed(2));
            arrWinRateB.push(((bWin / (i + 1)) * 100).toFixed(2));
          }
        }
        console.log(arrWinRateA);
        console.log(arrWinRateB);

        console.log(winLossArr);
        res.render('winRate'); // template EJS
        connection.release(); // Release the connection when done with it
        if (err) {
          reject(err);
          return;
        }
      }
    );
  });
});

// app.get('/calcRate', (req, res) => {
//   console.log(req.query.firstTeam);
//   console.log(req.query.secondTeam);
// });

// app.post('/calcRate', (req, res) => {
//   if (req.body.firstTeam == req.body.secondTeam) {
//     res.redirect('/NavBar%20Files/Teams%20Files/winRate.html');
//   } else {
//     let urlH2H =
//       '/calcRate/' + req.body.firstTeam + '/vs/' + req.body.secondTeam;
//     firstTeamName = req.body.firstTeam;
//     secondTeamName = req.body.secondTeam;
//     console.log(urlH2H);
//     res.redirect(urlH2H);
//   }
// });
// // console.log('/calcRate' + firstTeamName + '/vs/' + secondTeamName);

// app.get('/calcRate/:firstTeam/vs/:secondTeam', (req, res) => {
//   console.log(req.params);
//   res.render('winRateH2H');
// });
