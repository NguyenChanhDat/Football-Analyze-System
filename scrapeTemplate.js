const axios = require("axios");
const cheerio = require("cheerio");
axios
  .get("***")//the address of the website u wanna scrape data
  .then(({ data }) => {
    const $ = cheerio.load(data);

    const players = $("***")//the elements' parent's class
      .map((_, player) => {
        const $player = $(player);
        const name = $player.find("*****").text();//the players name element's class
        const position = $player.find(".col-lg-2.ac.fs09e").text();//the players position element's class
        return { name: name, position: position };
      })
      .toArray();
    players.pop();
    console.log(players);
  });
