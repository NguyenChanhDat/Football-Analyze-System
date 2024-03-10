const axios = require("axios");
const cheerio = require("cheerio");
axios
  .get("https://footystats.org/clubs/dpm-nam-dinh-fc-4019#")
  .then(({ data }) => {
    const $ = cheerio.load(data);

    const playerNames = $("p.col-lg-6.ellipses a.semi-bold")
      .map((_, product) => {
        const $product = $(product);
        return $product.text();
      })
      .toArray();
    console.log(playerNames);
  });
