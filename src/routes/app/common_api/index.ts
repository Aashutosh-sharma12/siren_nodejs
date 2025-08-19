import { Router } from "express";
const baseRoute = Router();
import list from './list';

baseRoute.use('/list', list);

export default baseRoute;