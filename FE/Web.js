const express = require("express");
const app = express();
// Setting EJS as the view engine
app.set("view engine", "ejs");

//Server is listening on port 8082
app.listen(8083, () => {
  console.log(`App listening at port 8083`);
});
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("pages/index");
  });
app.get("/", (req, res) => {
    res.render("pages/index");
  });
