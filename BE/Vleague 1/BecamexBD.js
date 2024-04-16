const axios = require("axios");
const cheerio = require("cheerio");
axios
  .get("https://footystats.org/clubs/becamex-binh-duong-fc-4000#")
  .then(({ data }) => {
    const $ = cheerio.load(data);

    const players = $("div.w94.rw100.cf.m0Auto")
      .map((_, player) => {
        const $player = $(player);
        const name = $player.find(".semi-bold").text();
        const position = $player.find(".col-lg-2.ac.fs09e").text();
        return { name: name, position: position };
      })
      .toArray();
    //pop manager
    players.pop();
    //pop unrelatived elements
    for (let i = 0; i < players.length; i++) {
      if (players[i].position == "") {
        players.splice(i, 1);
      }
    }
    console.log(players);
  });
