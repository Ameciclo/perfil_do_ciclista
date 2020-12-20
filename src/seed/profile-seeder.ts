import CyclistProfile from "../schemas/CyclistProfile";
import mongoose from "mongoose";
import config from "../config/config";
import seedData from "./seed.json";

const url = `mongodb://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.database}?authSource=admin`;

const seed = async () => {
  if (mongoose.connection.readyState !== 1) {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", async () => {
      console.info("🗄 Database is connected");
      await populate();
    });
  } else {
    await populate();
  }
};

const populate = async () => {
  /* This route will populate a local MongoDB database */
  if (process.env.NODE_ENV !== "production") {
    console.info("🌱 Seeding database...");
    await mongoose.connection.db.dropDatabase();
    seedData.forEach((s: any) => {
      const profile = new CyclistProfile(s);
      profile
        .save()
        .then((user) => {
          console.info(`🔑 Profile created`);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          mongoose.connection.close();
        });
    });
  }
};

seed();
