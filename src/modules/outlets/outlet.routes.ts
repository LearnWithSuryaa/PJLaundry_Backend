import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { listOutlets } from "./outlet.controller";
import { getOutletsQuerySchema } from "./outlet.schema";

const router = Router();

router.get("/outlets", validate({ query: getOutletsQuerySchema }), listOutlets);

export default router;

