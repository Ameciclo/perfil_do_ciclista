import { Application } from "../../src/app";
import express from "express";
import supertest from "supertest";
import CyclistProfile from "../../src/schemas/CyclistProfile";
import mongoose from "mongoose";

let application: Application;
export let app: express.Application;

const cyclistProfileMock = {
  data: {
    age: 43,
    age_standard: "de 1 a 2 Salários Mínimos",
    biggest_issue:
      "Falta de infraestrutura adequada (ciclovias, bicicletários, etc.)",
    biggest_need: "Mais segurança/educação no trânsito",
    collisions: "Não",
    color_race: "Branca",
    days_usage: {
      leisure: 1,
      school: 0,
      shopping: 0,
      total: 5,
      working: 5,
    },
    distance_time: 20,
    gender: "Masculino",
    job: "Encanador",
    motivation_to_continue: "É mais rápido e prático",
    motivation_to_start: "É mais rápido e prático",
    neighborhood_destiny: "Boa Viagem",
    neighborhood_living: "Imbiribeira",
    neighborhood_origin: "Imbiribeira",
    schooling: "Ensino Fundamental (primário e ginásio, até a oitava série)",
    transport_combination: {
      transportation: "",
      yes_no: false,
    },
    wage_standard: 2000,
    years_using: "entre 4 e 5 anos",
  },
  metadata: {
    area: "Área 1 - Área Central",
    bike_type: "Privada",
    city: "Recife",
    date: "2017-10-25T03:00:00.000Z",
    hour: "1899-12-30T17:19:36.000Z",
    location: {
      coordinates: [-8.11574, -34.895527],
      type: "Point",
    },
    neighborhood: "Boa Viagem",
    researcher_code: 30786,
    sheet_index: 1,
    weekday: "quarta-feira",
  },
};

describe("GET /v1/cyclist-profile", () => {
  beforeAll(async (done) => {
    application = await new Application();
    try {
      await application.setupDbAndServer();
    } catch (e) {
      console.error(e);
    }
    app = application.app;
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });

  afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });

  it("should GET /v1/cyclist-profile route and return 200", async (done) => {
    let cyclistProfile = await CyclistProfile.create(cyclistProfileMock);
    cyclistProfile = cyclistProfile.toJSON();
    cyclistProfile._id = cyclistProfile._id.toString();

    await supertest(app)
      .get("/v1/cyclist-profile/")
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data[0]._id).toMatch(cyclistProfile._id);
        expect(res.body.data[0].data).toMatchObject(cyclistProfile.data);
        expect(res.body.data[0].metadata).toMatchObject(
          cyclistProfile.metadata
        );
      });
    done();
  });

  it("should GET /v1/cyclist-profile/:id and return 200", async (done) => {
    let cyclistProfile = await CyclistProfile.create(cyclistProfileMock);
    cyclistProfile = cyclistProfile.toJSON();
    cyclistProfile._id = cyclistProfile._id.toString();

    await supertest(app)
      .get(`/v1/cyclist-profile/${cyclistProfile._id}`)
      .expect(200)
      .then((res) => {
        expect(res.body.cyclistProfile._id).toMatch(cyclistProfile._id);
        expect(res.body.cyclistProfile.data).toMatchObject(cyclistProfile.data);
        expect(res.body.cyclistProfile.metadata).toMatchObject(
          cyclistProfile.metadata
        );
      });
    done();
  });

  it("should POST /v1/cyclist-profile/summary and return 200", async (done) => {
    await CyclistProfile.create(cyclistProfileMock);

    await supertest(app)
      .post("/v1/cyclist-profile/summary")
      .send([
        { key: "gender", value: "Masculino" },
        { key: "gender", value: "Feminino" },
        { key: "gender", value: "Outro" },
      ])
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("data.dayAggregate");
        expect(res.body).toHaveProperty("data.yearAggregate");
        expect(res.body).toHaveProperty("data.genderCount");
        expect(res.body.data.dayAggregate.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data.yearAggregate.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data.genderCount.length).toBeGreaterThanOrEqual(1);
      });
    done();
  });
});
