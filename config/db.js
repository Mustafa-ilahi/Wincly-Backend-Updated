const mongoose = require(`mongoose`);
require(`dotenv`).config();

mongoose.connect(
  `mongodb+srv://${process.env.BD_USERNAME}:${process.env.DB_PASSWORD}@cluster0.cqemrgn.mongodb.net/${process.env.DB_COLLECTION}?retryWrites=true&w=majority`
);

module.exports = mongoose;
