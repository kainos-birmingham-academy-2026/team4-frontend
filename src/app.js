const express = require("express");
const nunjucks = require("nunjucks");
const path = require("path");

const app = express();

nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
});

app.set("view engine", "njk");

app.get("/", (_req, res) => {
  res.render("index", { message: "hello world" });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "UP",
    time: new Date().toISOString(),
  });
});

module.exports = app;
