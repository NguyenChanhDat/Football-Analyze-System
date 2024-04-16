const axios = require("axios");
const cheerio = require("cheerio");

axios
  .get("https://footystats.org/clubs/dpm-nam-dinh-fc-4019#")
  .then(({ data }) => {
    const $ = cheerio.load(data);

    const pokemonNames = $("p.col-lg-2.ac.fs09e")
      .map((_, product) => {
        const $product = $(product);
        return $product.text();
      })
      .toArray();
    console.log(pokemonNames);
  });
