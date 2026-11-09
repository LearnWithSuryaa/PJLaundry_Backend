import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { getServiceDetail, listServices } from "./service.controller";
import {
  getServiceDetailParamsSchema,
  getServicesQuerySchema,
} from "./service.schema";

const router = Router();

router.get(
  "/services",
  validate({ query: getServicesQuerySchema }),
  listServices
);

router.get(
  "/services/:id",
  validate({ params: getServiceDetailParamsSchema }),
  getServiceDetail
);

export default router;

