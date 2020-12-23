import { ILogger, Logger } from "../utils";
import { Document, Model } from "mongoose";
import CyclistProfile from "../schemas/CyclistProfile";
import { MongooseQueryParser } from "mongoose-query-parser";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import aqp from "api-query-params";

export class CyclistProfileService {
  logger: ILogger;
  private model: Model<Document>;

  constructor() {
    this.logger = new Logger(__filename);
    this.model = CyclistProfile;
  }

  async insert(data: any) {
    this.logger.info("Create a new Cyclist Profile", data);
    return await this.model.create(data);
  }

  async getAll() {
    return this.model.find();
  }

  // Possible filters
  // ?area&year&gender&race&income&age&schooling
  async getFiltered(q: any) {
    const query = aqp("metadata.city=Recife&data.gender!=Outro");
    console.log(query.filter);

    return this.model.find(query.filter);
  }

  async getById(id: string | number) {
    this.logger.info("Fetching cyclist profile by id: ", id);
    if (id) {
      return this.model.findById(id);
    }
    return Promise.reject(false);
  }
}
