import { Router } from 'express';
import userRoute from './user';
import commonRoute from './common_api'

// Export the base-router
const baseRouter = Router();

// Setup routers
baseRouter.use('/user', userRoute);
baseRouter.use('/common', commonRoute);

// Export default.
export default baseRouter;
