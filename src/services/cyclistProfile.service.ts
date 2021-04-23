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

  async fetchDashboardData(filters: any[]): Promise<Record<any, any>> {
    const groupedFilters = filters.reduce(
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
        { key: "biggest_need", value: "biggest_need" },
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

    let [dayAggregate, yearAggregate, needAggregate] = await Promise.all(
      promises
    );

    const groupBy = (array: any[], key: string) => {
      return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
          currentValue
        );
        return result;
      }, {});
    };

    // Prefer to use method to remove duplicated rather than use Sets
    const keys = Array.from(new Set(filters.map((f) => f["key"])));
    const values = Array.from(new Set(filters.map((f) => f["value"])));

    const series: { name: string; data: any[] }[] = [];
    const yearSeries: { name: string; data: any[] }[] = [];
    const needSeries: { name: string; data: any[] }[] = [];

    dayAggregate = dayAggregate.map((el, i: number) => {
      const grouped = groupBy(el, keys[i]);
      values.forEach((value) => {
        const valueFromKey = grouped[value];
        const result: any[] = [];

        if (valueFromKey !== undefined) {
          valueFromKey.forEach((item: any) => {
            result.push(item.total);
          });

          const test = {
            name: value,
            data: result,
          };
          series.push(test);
        }
      });
      return series;
    });

    yearAggregate = yearAggregate.map((el, i: number) => {
      const grouped = groupBy(el, keys[i]);
      values.forEach((value) => {
        const valueFromKey = grouped[value];
        const result: any[] = [];

        if (valueFromKey !== undefined) {
          valueFromKey.forEach((item: any) => {
            result.push(item.total);
          });

          const test = {
            name: value,
            data: result,
          };
          yearSeries.push(test);
        }
      });
      return yearSeries;
    });

    console.log(needAggregate);

    needAggregate = needAggregate.map((el, i: number) => {
      const grouped = groupBy(el, keys[i]);
      values.forEach((value) => {
        const valueFromKey = grouped[value];
        const result: any[] = [];

        if (valueFromKey !== undefined) {
          valueFromKey.forEach((item: any) => {
            result.push(item.total);
          });

          const test = {
            name: value,
            data: result,
          };
          needSeries.push(test);
        }
      });
      return needSeries;
    });

    const genderCount = await this.model.aggregate([
      {
        $group: {
          _id: "$data.gender",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $group: {
          _id: 0,
          counts: {
            $push: {
              name: "$_id",
              y: "$count",
            },
          },
        },
      },
    ]);

    console.log();

    return {
      dayAggregate: dayAggregate[0],
      yearAggregate: yearAggregate[0],
      needAggregate: needAggregate[0],
      genderCount: genderCount[0].counts,
    };
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
