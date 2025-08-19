import { Router } from 'express';
import { Request, Response } from 'express';
import path from 'path';
const viewsDir = path.join(__dirname, '../../public/admin/views');

const baseRouter = Router();

/***********************************************************************************
 *                                  Front-end routes
 **********************************************************************************/
baseRouter.get('/', (_: Request, res: Response) => {
    res.redirect('/admin/login')
});

//***********Login Page*************//
baseRouter.get('/login', (_: Request, res: Response) => {
    res.sendFile('auth/login.html', { root: viewsDir });
});

//*********Dashboard Page***************//

baseRouter.get('/dashboard', (_: Request, res: Response) => {
    res.sendFile('dashboard.html', { root: viewsDir });
});
//***********UserListing Page*************//
baseRouter.get('/user', (_: Request, res: Response) => {
    res.sendFile('listing/user.html', { root: viewsDir });
});
//***********SubscriptionListing Page*************//
baseRouter.get('/subscription', (_: Request, res: Response) => {
    res.sendFile('listing/subscription.html', { root: viewsDir });
});
//***********UserView Page*************//
baseRouter.get('/userView', (_: Request, res: Response) => {
    res.sendFile('listing/userView.html', { root: viewsDir });
});
//***********User Subscription Page*************//
baseRouter.get('/user_subscription', (_: Request, res: Response) => {
    res.sendFile('listing/user_subscription.html', { root: viewsDir });
});
//***********FAQ Page*************//
baseRouter.get('/FAQ', (_: Request, res: Response) => {
    res.sendFile('listing/FAQ.html', { root: viewsDir });
});
//***********Admin Settings Page*************//
baseRouter.get('/adminsetting', (_: Request, res: Response) => {
    res.sendFile('setting/adminsetting.html', { root: viewsDir });
});
//***********Admin Change Password Page*************//
baseRouter.get('/changepassword', (_: Request, res: Response) => {
    res.sendFile('setting/changepassword.html', { root: viewsDir });
});
//***********Admin Configuration Page*************//
baseRouter.get('/configuration', (_: Request, res: Response) => {
    res.sendFile('setting/configuration.html', { root: viewsDir });
});
//***********Admin Notification List Page*************//
baseRouter.get('/adminNotificationList', (_: Request, res: Response) => {
    res.sendFile('listing/adminNotificationList.html', { root: viewsDir });
});


export default baseRouter;