import { ILogger, Logger } from "../utils";
import { Document, Model } from "mongoose";
import CyclistProfile from "../schemas/CyclistProfile";
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

  async fetchDashboardData(q: any): Promise<Record<any, any>> {
    const filters = [
        { key: "gender", value: "Masculino" },
        { key: "gender", value: "Feminino" },
        { key: "color_race", value: "Branca" },
      ],
      groupedFilters = filters.reduce(
        (f: any, a: { key: string; value: string }) => {
          f[a.key] = f[a.key] || [];
          f[a.key].push(a);
          return f;
        },
        {}
      ),
      columns = [
        { key: "day", value: "days_usage.total" },
        { key: "years_using", value: "years_using" },
      ];

    const promises = columns.map(async (c) => {
      return await Promise.all(
        Object.keys(groupedFilters).map((k) => {
          const _id: any = { [c.key]: `$data.${c.value}` },
            $project: any = {
              [c.key]: `$_id.${c.key}`,
              total: "$total",
              _id: 0,
            };
          const $or = groupedFilters[k].map((f: { key: any; value: any }) => {
            _id[f.key] = `$data.${f.key}`;
            $project[f.key] = `$_id.${f.key}`;
            return { [`data.${f.key}`]: f.value };
          });
          return this.model.aggregate([
            {
              $match: {
                $or,
              },
            },
            {
              $group: {
                _id,
                total: {
                  $sum: 1,
                },
              },
            },
            {
              $project,
            },
            {
              $sort: { [c.key]: 1 },
            },
          ]);
        })
      );
    });

    const [dayAggregate, yearAggregate] = await Promise.all(promises);

    return { dayAggregate, yearAggregate };
  }

  async getFiltered(q: any) {
    const query = aqp(q);
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
