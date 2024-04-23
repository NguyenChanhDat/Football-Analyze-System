const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();

//Server is listening on port 8083
app.listen(8083, () => {
  console.log(`App listening at port 8083`);
});
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
  //__dirname : It will resolve to your project folder.
});
app.use("/", router);
