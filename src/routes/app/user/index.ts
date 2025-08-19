import { Router } from "express";
const baseRoute = Router();
import auth from "./auth";
import home from "./home";
import chat_room from "./chat_room";
import sub from "./subscription";

baseRoute.use('/auth', auth);
baseRoute.use('/home', home);
baseRoute.use('/chat_room', chat_room);
baseRoute.use('/sub', sub);
export default baseRoute;