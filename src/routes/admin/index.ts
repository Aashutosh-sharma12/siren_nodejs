import { Router } from "express";
import userRouter from "./user";
import authRoute from "./auth";
import faqRouter from './faq';
import feedRouter from './feed';
import dashboardRoute from "./dashboard";
import configRoute from "./config";
import subRouter from './subscription';
import appVersionRoute from "./appVersion";

const baserouter = Router();

baserouter.use('/user', userRouter)
baserouter.use('/auth', authRoute);
baserouter.use('/adminFAQ', faqRouter)
baserouter.use('/feed', feedRouter)
baserouter.use('/dashboard', dashboardRoute)
baserouter.use('/config', configRoute)
baserouter.use('/sub', subRouter)
baserouter.use('/app_setting', appVersionRoute)

export default baserouter;
