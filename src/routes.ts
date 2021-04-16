import { Router } from "express";
import cyclistProfileController from "./controllers/cyclistProfileController";

const router: Router = Router();

router.use("/cyclist-profile", cyclistProfileController);

export default router;
