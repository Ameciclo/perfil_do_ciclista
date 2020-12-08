import express from "express";
import cors from "cors";
import routes from "./routes";
import helmet from "helmet";
import morgan from "morgan";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { Logger, ILogger } from "./utils";
import nodeErrorHandler from "./middlewares/nodeErrorHandler";
import config from "./config/config";

export class Application {
  app: express.Application;
  logger: ILogger;
  config = config;

  constructor() {
    this.logger = new Logger(__filename);
    this.app = express();
    this.app.locals.name = this.config.name;
    this.app.locals.version = this.config.version;
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(
      morgan("dev", {
        skip: () => process.env.NODE_ENV === "test",
      })
    );
    this.app.disable("x-powered-by");
    this.app.use("/perfil/v1", routes);
    this.app.get("*", function (req, res) {
      res.status(404).json({ message: "Not found" });
    });
  }

  setupDbAndServer = async () => {
    const conn = await createConnection();
    this.logger.info(
      `Connected to database. Connection: ${conn.name} / ${conn.options.database}`
    );
    await this.startServer();
  };

  startServer(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.app
        .listen(+this.config.port, this.config.host, () => {
          this.logger.info(
            `Server started at http://${this.config.host}:${this.config.port}`
          );
          resolve(true);
        })
        .on("error", nodeErrorHandler);
    });
  }
}
