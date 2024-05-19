const axios = require('axios');
const cheerio = require('cheerio');

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
async function scrapeH2H(i, j) {
  if (i == 20 && j == 20) {
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
      // let recArr = [];
      // console.log(records[0].length);
      // for (let i = 0; i < records[0].length / 18; i++) {
      //   recArr.push(records[0].slice(i * 18, i * 18 + 18));
      // }
      console.log(records);
    })
    .then((response) => {
      scrapeH2H(i, j + 1);
    });
  // .then((response2) => {
  //   scrapeH2H(i + 1, j);
  // });
}

async function terminate(i) {
  scrapeH2H(i, i + 1);
}
terminate(0);
// async function secondLoop(i) {
//   if (i == 20) {
//     return;
//   }
//   terminate(i).then((response) => {
//     secondLoop(i + 1);
//   });
// }
// secondLoop(0);
