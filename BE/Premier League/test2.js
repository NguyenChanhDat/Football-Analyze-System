const axios = require("axios");
const cheerio = require("cheerio");
axios
  .get(
    "https://footystats.org/england/arsenal-fc-vs-wolverhampton-wanderers-fc-h2h-stats"
  )
  .then(({ data }) => {
    const $ = cheerio.load(data);

    const playerNames = $("a.fixture.changeH2HDataButton_neo div span")
      .map((_, product) => {
        const $product = $(product);
        return $product.text();
      })
      .toArray();
    console.log(playerNames);
  });
