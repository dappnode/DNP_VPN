import express from "express";
import bodyParser from "body-parser";

const port = 3030;
const app = express();

app.use(bodyParser.text());

app.get("/", (req, res) => {
  console.log(req);
  console.log(req.body);
  res.send();
});
app.post("/", (req, res) => {
  console.log(req);
  console.log(req.body);
  res.send();
});

app.listen(port, () => console.log(`OpenVPN listener API started at ${port}`));
