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
  // if (
  //   req.query.firstTeam != 'AFC Bournemouth' &&
  //   req.query.secondTeam != 'AFC Bournemouth'
  // ) {
  //   var teamOne = req.query.firstTeam + ' FC';
  //   var teamTwo = req.query.secondTeam + ' FC';
  // }
  var teamOne = req.query.firstTeam;
  var teamTwo = req.query.secondTeam;

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
        // console.log(queryResult);
        let aWin = 0;
        let bWin = 0;
        let aLoss = 0;
        let bLoss = 0;
        let aWinArr = [];
        let bWinArr = [];
        let aLossArr = [];
        let bLossArr = [];
        let arrWinRateA = [];
        let arrWinRateB = [];

        //cal teamOne or Two win rate after each match
        for (let i = 0; i < queryResult.length; i++) {
          if (
            //a Draw
            (queryResult[i].homeTeam == teamOne ||
              queryResult[i].awayTeam == teamOne) &&
            queryResult[i].result.slice(0, 1) ==
              queryResult[i].result.slice(2, 3)
          ) {
            aWinArr.push(aWin); //A Win Array after Each Round
            bWinArr.push(bWin); //B Win Array after Each Round
            arrWinRateA.push(((aWin / (i + 1)) * 100).toFixed(2));
            arrWinRateB.push(((bWin / (i + 1)) * 100).toFixed(2));
          } else if (
            (queryResult[i].homeTeam == teamOne &&
              queryResult[i].result.slice(0, 1) >
                queryResult[i].result.slice(2, 3)) ||
            (queryResult[i].awayTeam == teamOne &&
              queryResult[i].result.slice(0, 1) <
                queryResult[i].result.slice(2, 3))
          ) {
            // 1 as teamOne win
            aWin++; //teamOne win
            bLoss++; //teamLoss win
            aWinArr.push(aWin);
            bWinArr.push(bWin);
            aLossArr.push(aLoss);
            bLossArr.push(bLoss);
            arrWinRateA.push(((aWin / (i + 1)) * 100).toFixed(2));
            arrWinRateB.push(((bWin / (i + 1)) * 100).toFixed(2));
          } else {
            //teamTwo win
            bWin++;
            aWinArr.push(aWin);
            bWinArr.push(bWin);
            //teamOne Loss
            aLoss++;
            aLossArr.push(aLoss);
            bLossArr.push(bLoss);
            arrWinRateB.push(((bWin / (i + 1)) * 100).toFixed(2));
            arrWinRateA.push(((aWin / (i + 1)) * 100).toFixed(2));
          }
        }

        console.log(arrWinRateA);
        console.log(arrWinRateB);
        let totalGoalScoreA = 0;
        let totalGoalScoreB = 0;
        let totalGoalConcededA = 0;
        let totalGoalConcededB = 0;

        for (let i = 0; i < queryResult.length; i++) {
          if (queryResult[i].homeTeam == teamOne) {
            totalGoalScoreA += parseInt(queryResult[i].result.slice(0, 1)); //Goal score TeamOne each round
            totalGoalScoreB += parseInt(queryResult[i].result.slice(2, 3)); //Goal score TeamTwo each round
            totalGoalConcededB += parseInt(queryResult[i].result.slice(0, 1)); //Goal Conceded TeamTwo each round
            totalGoalConcededA += parseInt(queryResult[i].result.slice(2, 3)); //Goal Conceded TeamOne each round
          } else {
            totalGoalScoreB += parseInt(queryResult[i].result.slice(0, 1)); //Goal score TeamTwo each round
            totalGoalScoreA += parseInt(queryResult[i].result.slice(2, 3)); //Goal score TeamOne each round
            totalGoalConcededA += parseInt(queryResult[i].result.slice(0, 1)); //Goal Conceded TeamOne each round
            totalGoalConcededB += parseInt(queryResult[i].result.slice(2, 3)); //Goal Conceded TeamTwo each round
          }
        }

        //Calc Matrix X * Matrix tX
        function calWinRate(
          aWinArr,
          bWinArr,
          totalGoalScoreA,
          totalGoalScoreB,
          totalGoalConcededA,
          totalGoalConcededB,
          arrWinRateA,
          arrWinRateB,
          aWinArr,
          bWinArr,
          aLossArr,
          bLossArr
        ) {
          let XtX =
            1 +
            (aWinArr[aWinArr.length - 1] - bWinArr[bWinArr.length - 1]) *
              (aWinArr[aWinArr.length - 1] - bWinArr[bWinArr.length - 1]) +
            (aLossArr[aLossArr.length - 1] - bLossArr[bLossArr.length - 1]) *
              (aLossArr[aLossArr.length - 1] - bLossArr[bLossArr.length - 1]) +
            (totalGoalScoreA - totalGoalScoreB) *
              (totalGoalScoreA - totalGoalScoreB) +
            (totalGoalConcededA - totalGoalConcededB) *
              (totalGoalConcededA - totalGoalConcededB);
          let winRatePast = arrWinRateA[arrWinRateA.length - 1];
          let Beta = [];
          //calc Matrix Beta
          Beta.push((1 * (1 / XtX) * winRatePast).toFixed(2));
          Beta.push(
            (
              (1 / XtX) *
              winRatePast *
              (aWinArr[aWinArr.length - 1] - bWinArr[bWinArr.length - 1])
            ).toFixed(2)
          );
          Beta.push(
            (
              (1 / XtX) *
              winRatePast *
              (aLossArr[aLossArr.length - 1] - bLossArr[bLossArr.length - 1])
            ).toFixed(2)
          );
          Beta.push(
            (
              (1 / XtX) *
              winRatePast *
              (totalGoalScoreA - totalGoalScoreB)
            ).toFixed(2)
          );
          Beta.push(
            (
              (1 / XtX) *
              winRatePast *
              (totalGoalConcededA - totalGoalConcededB)
            ).toFixed(2)
          );
          let wrPredict =
            parseFloat(Beta[0]) +
            parseFloat(
              Beta[1] *
                (aWinArr[aWinArr.length - 1] - bWinArr[bWinArr.length - 1])
            ) +
            parseFloat(
              Beta[2] *
                (aLossArr[aLossArr.length - 1] - bLossArr[bLossArr.length - 1])
            ) +
            parseFloat(Beta[3] * (totalGoalScoreA - totalGoalScoreB)) +
            parseFloat(Beta[4] * (totalGoalConcededA - totalGoalConcededB));
          return wrPredict.toFixed(2);
        }
        let teamOneWinRate = calWinRate(
          aWinArr,
          bWinArr,
          totalGoalScoreA,
          totalGoalScoreB,
          totalGoalConcededA,
          totalGoalConcededB,
          arrWinRateA,
          arrWinRateB,
          aWinArr,
          bWinArr,
          aLossArr,
          bLossArr
        );
        let teamTwoWinRate = calWinRate(
          bWinArr,
          aWinArr,
          totalGoalScoreB,
          totalGoalScoreA,
          totalGoalConcededB,
          totalGoalConcededA,
          arrWinRateB,
          arrWinRateA,
          bWinArr,
          aWinArr,
          bLossArr,
          aLossArr
        );
        var drawRate = (100 - teamOneWinRate - teamTwoWinRate).toFixed(2);
        let winRateArr = [];
        winRateArr.push(teamOneWinRate);
        winRateArr.push(teamTwoWinRate);
        winRateArr.push(drawRate);

        console.log(teamOneWinRate + ' teamOneWinRate');
        console.log(teamTwoWinRate + ' teamTwoWinRate');
        console.log(drawRate + ' drawRate');
        // console.log(100 - teamOneWinRate - teamTwoWinRate);
        res.render('winRate', { winRateArr }); // template EJS
        connection.release(); // Release the connection when done with it
        if (err) {
          reject(err);
          return;
        }
      }
    );
  });
});
