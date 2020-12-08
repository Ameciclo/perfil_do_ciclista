import { Router } from "express";
import * as welcomeController from "./controllers/welcomeController";
import cyclistProfileController from "./controllers/cyclistProfileController";

const router: Router = Router();

router.get("/", welcomeController.index);
router.use("/cyclistProfile", cyclistProfileController);

export default router;
