import request from "supertest";
import { Application } from "../../src/app";
import express from "express";

let application: Application; // instance of our Application class
export let app: express.Application; // express app// express app

describe("GET /perfil/v1/", () => {
  beforeAll(async () => {
    application = await new Application();
    await application.setupDbAndServer();
    app = application.app;
  });

  afterAll(async (done) => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)); // PLUS THE HACK PROVIDED BY @yss14
    done();
  });

  it("should GET /perfil/v1/ route and return 200", async (done) => {
    const res = await request(app).get("/perfil/v1/");
    expect(res.status).toBe(200);
    done();
  });

  it("should GET /perfil/v1/cyclist-profile route and return 200", async (done) => {
    const res = await request(app).get("/perfil/v1/cyclist-profile/");
    expect(res.status).toBe(200);
    done();
  });
});
