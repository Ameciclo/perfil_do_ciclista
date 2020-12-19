import CyclistProfile from "../schemas/CyclistProfile";
import mongoose from "mongoose";
import config from "../config/config";

export const seedCyclistProfiles = async () => {
  try {
  } catch (e) {
    console.log(e);
  }
};

seedCyclistProfiles();
const url = `mongodb://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.database}?authSource=admin`;
mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

let profile = new CyclistProfile({
  metadata: {
    sheet_index: 1,
    city: "Recife",
    area: "Área 1 - Área Central",
    hour: "1899-12-30T17:19:36.000Z",
    location: {
      latitude: -8.11574,
      longitude: -34.895527,
    },
    neighborhood: "Boa Viagem",
    date: "2017-10-25T03:00:00.000Z",
    weekday: "quarta-feira",
    researcher_code: 30786,
    biketype: "Privada",
  },
  data: {
    days_usage: {
      total: 5,
      working: 5,
      shopping: 0,
      school: 0,
      leisure: 1,
    },
    years_using: "entre 4 e 5 anos",
    motivation_to_start: "É mais rápido e prático",
    biggest_issue:
      "Falta de infraestrutura adequada (ciclovias, bicicletários, etc.)",
    collisions: "Não",
    neighborhood_living: "Imbiribeira",
    transport_combination: {
      yes_no: false,
      transportation: "",
    },
    age: 43,
    schooling: "Ensino Fundamental (primário e ginásio, até a oitava série)",
    job: "Encanador",
    distance_time: 20,
    gender: "Masculino",
    motivation_to_continue: "É mais rápido e prático",
    biggest_need: "Mais segurança/educação no trânsito",
    color_race: "Branca",
    neighborhood_origin: "Imbiribeira",
    neighborhood_destiny: "Boa Viagem",
    wage: 2000,
    wage_standard: "de 1 a 2 Salários Mínimos",
  },
});

profile
  .save()
  .then((user) => {
    console.log(`profile created`);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    mongoose.connection.close();
  });
