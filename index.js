const express = require("express");
const path = require("path");
const app = express();

require("dotenv").config();
// const host = process.env.HOST || "localhost";

const cors = require("cors");
const bodyParser = require("body-parser");

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    methods: ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"],
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

require("./app/routes/index")(app);

app.get("/", (req, res) => {
  return res.status(200).send({
    error: false,
    message: "Welcome to real-estate-api",
  });
});

const port = process.env.PORT || 8080;

app.listen(port, () =>
  console.log(`App is listening at http://:${port}`)
);

module.exports = app;
