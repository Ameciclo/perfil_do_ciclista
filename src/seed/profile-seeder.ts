import CyclistProfile from "../schemas/CyclistProfile";
import mongoose, { CallbackError } from "mongoose";
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
  console.info("🌱 Seeding database...");
  await mongoose.connection.db.dropDatabase();
  const profileOps: Array<Promise<any>> = [];
  console.time("Seeding Time"); // Benchmarking the seed process.
  seedData.forEach((s: any) => {
    profileOps.push(saveProfileAsync(s));
  });
  await Promise.all(profileOps);
  await mongoose.connection.close();
  console.timeEnd("Seeding Time");
};

const saveProfileAsync = (profile: any) => {
  return new Promise<void>((resolve, reject) => {
    new CyclistProfile(profile).save(function (err: CallbackError) {
      if (err) reject(err);
      else resolve();
    });
  });
};

seed();
