const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql');
const con = mysql.createPool({
  host: 'localhost',
  user: 'sqluser',
  password: 'dat20112011',
  database: 'epl',
});

let teamsName = [
  'Arsenal',
  'Manchester City',
  'Liverpool',
  'Aston Villa',
  'Tottenham Hotspur',
  'Newcastle United',
  'Manchester United',
  'Chelsea',
  'West Ham United',
  'AFC Bournemouth',
  'Wolverhampton Wanderers',
  'Fulham',
  'Brighton & Hove Albion',
  'Crystal Palace',
  'Brentford',
  'Everton',
  'Nottingham Forest',
  'Luton Town',
  'Burnley',
  'Sheffield United',
];
let teamMetricsURLName = [
  'arsenal-fc',
  'manchester-city-fc',
  'liverpool-fc',
  'aston-villa-fc',
  'tottenham-hotspur-fc',
  'newcastle-united-fc',
  'manchester-united-fc',
  'chelsea-fc',
  'west-ham-united-fc',
  'afc-bournemouth',
  'wolverhampton-wanderers-fc',
  'fulham-fc',
  'brighton-hove-albion-fc',
  'crystal-palace-fc',
  'brentford-fc',
  'everton-fc',
  'nottingham-forest-fc',
  'luton-town-fc',
  'burnley-fc',
  'sheffield-united-fc',
];

let matches = []; //GLOBAL VAR FOR MATCHES DATA

async function scrapeH2H(i, j) {
  if (i == 19) {
    console.log('END SCRAPING');
    // STORE DATA INTO MYSQL
    con.getConnection(function (err, connection) {
      if (err) throw err;
      console.log('Connected!');
      for (let k = 0; k < matches.length; k++) {
        connection.query(
          'INSERT INTO h2h (homeTeam, awayTeam, result) VALUES (?, ?, ?)',
          [matches[k].home, matches[k].away, matches[k].result],
          function (err, result) {
            if (err) {
              connection.release(); // Release the connection if there's an error
              throw err;
            }
          }
        );
      }
      console.log('Finished Storing Data');
    });
    return;
  }
  if (j == 20) {
    console.log('FINISHED SCRAPING ' + teamsName[i]);
    i++;
    j = i + 1;
  }

  axios
    .get(
      'https://footystats.org/england/' +
        teamMetricsURLName[i] +
        '-vs-' +
        teamMetricsURLName[j] +
        '-h2h-stats'
    )
    .then(({ data }) => {
      const $ = cheerio.load(data);

      const records = $('.sliding-fixtures')
        .map((_, record) => {
          const $record = $(record);
          const matchTeams = $record.find('.inner .fixture .team').text();
          // const position = $record.find('.col-lg-2.ac.fs09e').text();
          return matchTeams;
        })
        .toArray();
      let recArr = [];
      let oneMatchStringLength = teamsName[i].length + teamsName[j].length + 4;
      // console.log(oneMatchStringLength);
      for (let k = 0; k < records[0].length / oneMatchStringLength; k++) {
        recArr.push(
          records[0].slice(
            k * oneMatchStringLength,
            k * oneMatchStringLength + oneMatchStringLength
          )
        );
      }
      for (let k = 0; k < recArr.length; k++) {
        let match = {};
        if (recArr[k].slice(0, teamsName[i].length) == teamsName[i]) {
          match.home = teamsName[i];
          match.away = teamsName[j];
          match.result =
            recArr[k].slice(teamsName[i].length + 1, teamsName[i].length + 2) +
            '-' +
            recArr[k].slice(
              teamsName[i].length + 2 + teamsName[j].length + 1,
              recArr[k].length
            );
        } else {
          match.home = teamsName[j];
          match.away = teamsName[i];
          match.result =
            recArr[k].slice(teamsName[j].length + 1, teamsName[j].length + 2) +
            '-' +
            recArr[k].slice(
              teamsName[j].length + 2 + teamsName[i].length + 1,
              recArr[k].length
            );
        }
        matches.push(match);
      }
    })
    .then((response) => {
      console.log(
        'Finished scraping matches between ' +
          teamsName[i] +
          ' and ' +
          teamsName[j]
      );
      scrapeH2H(i, j + 1);
    })
    .catch((error) => {
      console.log('Error Scraping ' + teamsName[i] + ' vs ' + teamsName[j]);
      scrapeH2H(i, j + 1);
    });
}

async function terminate(i) {
  scrapeH2H(i, i + 1);
}
terminate(18);
