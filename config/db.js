const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDatabase = async () => {
  await mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Database connected Successfully`);
    })
    .catch((err) => {
      console.log(`Error while connecting database`);
    });
};

module.exports = connectDatabase;
