"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const viewsDir = path_1.default.join(__dirname, '../../public/admin/views');
const baseRouter = (0, express_1.Router)();
/***********************************************************************************
 *                                  Front-end routes
 **********************************************************************************/
baseRouter.get('/', (_, res) => {
    res.redirect('/admin/login');
});
//***********Login Page*************//
baseRouter.get('/login', (_, res) => {
    res.sendFile('auth/login.html', { root: viewsDir });
});
//*********Dashboard Page***************//
baseRouter.get('/dashboard', (_, res) => {
    res.sendFile('dashboard.html', { root: viewsDir });
});
//***********UserListing Page*************//
baseRouter.get('/user', (_, res) => {
    res.sendFile('listing/user.html', { root: viewsDir });
});
//***********SubscriptionListing Page*************//
baseRouter.get('/subscription', (_, res) => {
    res.sendFile('listing/subscription.html', { root: viewsDir });
});
//***********UserView Page*************//
baseRouter.get('/userView', (_, res) => {
    res.sendFile('listing/userView.html', { root: viewsDir });
});
//***********Category Page*************//
baseRouter.get('/category', (_, res) => {
    res.sendFile('listing/categoriesListing.html', { root: viewsDir });
});
//***********FAQ Page*************//
baseRouter.get('/FAQ', (_, res) => {
    res.sendFile('listing/FAQ.html', { root: viewsDir });
});
//***********Admin Settings Page*************//
baseRouter.get('/adminsetting', (_, res) => {
    res.sendFile('setting/adminsetting.html', { root: viewsDir });
});
//***********Admin Change Password Page*************//
baseRouter.get('/changepassword', (_, res) => {
    res.sendFile('setting/changepassword.html', { root: viewsDir });
});
//***********Admin Configuration Page*************//
baseRouter.get('/configuration', (_, res) => {
    res.sendFile('setting/configuration.html', { root: viewsDir });
});
//***********Admin Notification List Page*************//
baseRouter.get('/adminNotificationList', (_, res) => {
    res.sendFile('listing/adminNotificationList.html', { root: viewsDir });
});
exports.default = baseRouter;
