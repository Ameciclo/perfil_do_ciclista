import { Request, Response } from "express";
import config from "../config/config";

const { messages } = config;

/**
 * Controller to handle / GET request, show API information
 *
 *
 * @param {Request} req
 * @param {Response} res
 */
export function index(req: Request, res: Response) {
  res.status(200).json({
    name: req.app.locals.name,
    message: messages.helloWorld,
    version: req.app.locals.version,
  });
}
