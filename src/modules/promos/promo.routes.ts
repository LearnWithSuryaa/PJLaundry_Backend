import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { listPromos } from "./promo.controller";
import { getPromosQuerySchema } from "./promo.schema";

const router = Router();

router.get("/promos", validate({ query: getPromosQuerySchema }), listPromos);

export default router;

