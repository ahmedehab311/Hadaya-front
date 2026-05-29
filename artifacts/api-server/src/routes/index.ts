import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import collectionsRouter from "./collections";
import ordersRouter from "./orders";
import giftRouter from "./gift";
import adminDashboardRouter from "./admin/dashboard";
import adminOrdersRouter from "./admin/orders";
import adminProductsRouter from "./admin/products";
import adminCollectionsRouter from "./admin/collections";
import adminSettingsRouter from "./admin/settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(collectionsRouter);
router.use(ordersRouter);
router.use(giftRouter);
router.use(adminDashboardRouter);
router.use(adminOrdersRouter);
router.use(adminProductsRouter);
router.use(adminCollectionsRouter);
router.use(adminSettingsRouter);

export default router;
