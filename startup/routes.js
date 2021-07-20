const express = require("express");
const indexRouter = require("../routes/index");
const bestSellersRouter = require("../routes/bestSellers");
const registerRouter = require("../routes/register");
const loginRouter = require("../routes/login");
const listsRouter = require("../routes/myLists");
const aboutRouter = require("../routes/about");
const logoutRouter = require("../routes/logout");

module.exports = app => {
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  app.use("/", indexRouter);
  app.use("/best_sellers", bestSellersRouter);
  app.use("/register", registerRouter);
  app.use("/login", loginRouter);
  app.use("/my_lists", listsRouter);
  app.use("/about", aboutRouter);
  app.use("/logout", logoutRouter);
};