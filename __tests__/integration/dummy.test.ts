import request from "supertest";
import { Application } from "../../src/app";
import express from "express";

let application: Application; // instance of our Application class
export let app: express.Application; // express app// express app

describe("GET /perfil/v1/", () => {
  beforeAll(async () => {
    application = await new Application();
    app = application.app;
  });

  it("should GET /perfil/v1/ route and return 200", async (done) => {
    const res = await request(app).get("/perfil/v1/");
    expect(res.status).toBe(200);
    done();
  });
});
