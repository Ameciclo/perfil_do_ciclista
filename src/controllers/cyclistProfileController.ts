import { NextFunction, Request, Response, Router } from "express";
import config from "../config/config";
import { ApiResponseError } from "../resources/interfaces/ApiResponseError";
import { CyclistProfileService } from "../services/cyclistProfile.service";

const { errors } = config;
const cyclistProfileRouter: Router = Router();

// /cyclistProfile
cyclistProfileRouter
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const cyclistProfileService = new CyclistProfileService(),
      q = req.query;
    try {
      let response;
      if (q) {
        response = await cyclistProfileService.getFiltered(q);
      } else {
        response = await cyclistProfileService.getAll();
      }
      // return 200 even if no user found. Empty array. Not an error
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (err) {
      const error: ApiResponseError = {
        code: 400,
        errorObj: err,
      };
      next(error);
    }
  });

cyclistProfileRouter
  .route("/summary/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const cyclistProfileService = new CyclistProfileService(),
      q = req.query;
    try {
      let response;
      if (q) {
        response = await cyclistProfileService.fetchDashboardData(q);
      } else {
        response = await cyclistProfileService.getAll();
      }
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (err) {
      const error: ApiResponseError = {
        code: 400,
        errorObj: err,
      };
      next(error);
    }
  });

// /cyclistProfile/:id
cyclistProfileRouter
  .route("/:id")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const cyclistProfileService = new CyclistProfileService();
    try {
      const cyclistProfile = await cyclistProfileService.getById(req.params.id);

      // if user not found
      if (!cyclistProfile) {
        res.status(404).json({
          success: false,
          message: `${errors.entityNotFound}: cyclist profile id`,
        });
        return;
      }
      // return found user
      res.status(200).json({
        success: true,
        cyclistProfile: cyclistProfile,
      });
    } catch (err) {
      // db exception. example: wrong syntax of id e.g. special character
      const error: ApiResponseError = {
        code: 400,
        errorObj: err,
      };
      next(error);
    }
  });

// /cyclistProfile POST
cyclistProfileRouter
  .route("/")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const cyclistProfileService = new CyclistProfileService();
    try {
      const response = await cyclistProfileService.insert(req.body);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (err) {
      // DB exception or some other exception while inserting user
      const error: ApiResponseError = {
        code: 400,
        errorObj: err,
      };
      next(error);
    }
  });

export default cyclistProfileRouter;
