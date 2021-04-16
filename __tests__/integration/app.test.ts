import request from "supertest";
import { Application } from "../../src/app";
import express from "express";
import supertest from "supertest";

let application: Application;
export let app: express.Application;

describe("GET /v1/cyclist-profile", () => {
  beforeAll(async (done) => {
    application = await new Application();
    try {
      await application.setupDbAndServer();
    } catch (e) {
      console.error(e);
    }
    app = application.app;
    done();
  });

  it("should GET /v1/cyclist-profile route and return 200", async (done) => {
    await supertest(app)
      .get("/v1/cyclist-profile/")
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data.length).toEqual(500);
        expect(res.body.data[0]).toHaveProperty("metadata");
        expect(res.body.data[0]).toHaveProperty("data");
        expect(res.body.data[0]).toHaveProperty("_id");
      });
    done();
  });

  // TODO: Insert the cyclist-profile before this test and hold the id on a variable
  // it("should GET /v1/cyclist-profile/:id and return 200", async (done) => {
  //   await supertest(app)
  //     .get("/v1/cyclist-profile/60799499d2c805c2dcd305ed")
  //     .expect(200)
  //     .then((res) => {
  //       expect(res.body).toHaveProperty("cyclistProfile.metadata");
  //       expect(res.body).toHaveProperty("cyclistProfile.data");
  //       expect(res.body).toHaveProperty("cyclistProfile._id");
  //     });
  //   done();
  // });

  it("should POST /v1/cyclist-profile/summary and return 200", async (done) => {
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
        expect(res.body.data.dayAggregate.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data.yearAggregate.length).toBeGreaterThanOrEqual(1);
      });
    done();
  });
});
