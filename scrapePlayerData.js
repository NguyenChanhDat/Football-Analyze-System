const axios = require("axios");
const cheerio = require("cheerio");
axios
  .get("https://footystats.org/clubs/dpm-nam-dinh-fc-4019#")
  .then(({ data }) => {
    const $ = cheerio.load(data);

    const players = $("p.col-lg-6.ellipses")
      .map((_, player) => {
        const $player = $(player);
        const name = $player.find(".semi-bold").text();
        const position = $player.find(".col-lg-2.ac.fs09e").text();
        return { name: name, position: position };
      })
      .toArray();
    players.pop();
    console.log(players);
  });
