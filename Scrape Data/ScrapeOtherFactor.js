const mysql = require('mysql');
const axios = require('axios');
const cheerio = require('cheerio');
const con = mysql.createPool({
  host: 'localhost',
  user: 'sqluser',
  password: 'dat20112011',
  database: 'epl',
});
// //scrape otherFactor

let teamMetricsURLName = [
  'arsenal-fc-59',
  'manchester-city-fc-93',
  'liverpool-fc-151',
  'aston-villa-fc-158',
  'tottenham-hotspur-fc-92',
  'manchester-united-fc-149',
  'newcastle-united-fc-157',
  'chelsea-fc-152',
  'west-ham-united-fc-153',
  'afc-bournemouth-148',
  'wolverhampton-wanderers-fc-223',
  'fulham-fc-162',
  'brighton-hove-albion-fc-209',
  'crystal-palace-fc-143',
  'brentford-fc-218',
  'everton-fc-144',
  'nottingham-forest-fc-211',
  'luton-town-fc-271',
  'burnley-fc-145',
  'sheffield-united-fc-251',
];
let avgPoss = [];
async function getTeamMetricsBase(i) {
  if (i == 20) {
    con.getConnection(function (err, connection) {
      if (err) throw err;
      console.log('Connected!');
      for (let i = 0; i < 20; i++) {
        connection.query(
          'UPDATE teamsmetrics SET avgPossession =(?) WHERE Id =(?)',
          [avgPoss[i], i + 1],
          function (err, result) {
            if (err) {
              connection.release(); // Release the connection if there's an error
              throw err;
            }
          }
        );
        console.log(
          'AvgPoss ' + avgPoss[i] + ' ' + teamMetricsURLName[i] + ' added'
        );
      }
    });
  }
  axios
    .get('https://footystats.org/clubs/' + teamMetricsURLName[i])
    .then(({ data }) => {
      const $ = cheerio.load(data);

      const teams = $('.comparison-table-table .row ')
        .map((_, team) => {
          const $team = $(team);
          const avgPossession = $team.find('.item.stat').text();
          return {
            avgPossession: avgPossession,
          };
        })
        .toArray();
      avgPoss[i] = teams[11].avgPossession.slice(0, 2);
      avgPoss[i] = ((avgPoss[i] / 100) * 90).toFixed(2);
      console.log(avgPoss[i] + ' average Possession ' + teamMetricsURLName[i]);
      // console.log(teams[11]);
    })
    .then((response) => {
      getTeamMetricsBase(i + 1);
    });
}
async function terminateGetTeamMetrics() {
  getTeamMetricsBase(0);
}
terminateGetTeamMetrics().then((response) => {});

// Function to scrape players' data
// for (let i = 0; i < teamMetricsURLName.length; i++) {
//   async function scrapePlayersData() {
//     try {
//       const { data } = await axios.get(
//         'https://footystats.org/clubs/' + teamMetricsURLName[i]
//       );
//       const $ = cheerio.load(data);

//       const teamsName = $('.comparison-table-table .row .item.stat')
//         .map((_, teamsName) => {
//           const $teamsName = $(teamsName);
//           return $teamsName.text();
//         })
//         .toArray();

//       return teamsName; // Return the teamsName array
//     } catch (error) {
//       console.error("Error scraping teams' data:", error);
//       return []; // Return an empty array in case of error
//     }
//   }

//   (async () => {
//     const teamsData = await scrapePlayersData();
//     let result = teamsData.slice(33, 36);
//     avgPoss[i] = result[0];
//     avgPoss[i] = parseInt(avgPoss[i]);
//     avgPoss[i] = ((avgPoss[i] / 100) * 90).toFixed(2);
//   })();
// }
// console.log(avgPoss);
