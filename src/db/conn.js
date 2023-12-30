const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/youtubeRegistration")
  .then(() => {
    console.log("connection successful");
  })
  .catch(() => {
    console.log("No connection");
  });