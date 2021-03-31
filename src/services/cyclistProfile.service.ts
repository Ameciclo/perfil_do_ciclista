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

    let [dayAggregate, yearAggregate] = await Promise.all(promises);

    // filters =
    // [
    //   { key: "gender", value: "Masculino" },
    //   { key: "gender", value: "Feminino" },
    //   { key: "color_race", value: "Branca" },
    // ]

    // var groupBy = function(xs: any[], key: string | number) {
    //   return xs.reduce(function(rv: { [x: string]: never[]; }, x: { [x: string]: string | number; }) {
    //     (rv[x[key]] = rv[x[key]] || []).push(x);
    //     return rv;
    //   }, {});
    // };
    
    // const keys = groupBy(filters, 'key');
    // console.log(keys);

    const groupBy = (array: any[], key: string) => {
      return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
          currentValue
        );
        return result;
      }, {}); 
    };

    // Prefer to use method to remove duplicated rather than use Sets
    let keys = Array.from(new Set(filters.map((f) => f["key"])))
    let values = Array.from(new Set(filters.map((f) => f["value"])))


    // 2[0,1]
    // groupBy(el, )

    let series: { name: string; data: any[]; }[] = []


    dayAggregate = dayAggregate.map((el, i: number) => {
      console.log(i)

      const grouped = groupBy(el, keys[i]);
      values.forEach(value => {
        const valueFromKey = grouped[value];
        let result: any[] = [];

        if (valueFromKey !== undefined) {
        valueFromKey.forEach((item: any) => {
          result.push(item.total);
        })

        const test = {
          name: value,
          data: result
        }        
        series.push(test);
      }

        // Masculino: [
        // { day: 1, value 2}
        // { day: 1, value 2}
        // { day: 1, value 2 }  
        // ]
        //
      })
      return series;
    });
    
  


    
    // series: [{
    //   name: "Masculino",
    //   data: [1, 2, 3]
    // },
    // {
    //   name: "Feminino",
    //   data: [1, 2, 3]
    // },
    //
    // {
    //   name: "Branco",
    //   data: [3, 5, 1]
    // }]
    
    return { dayAggregate: dayAggregate[0], yearAggregate };
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
