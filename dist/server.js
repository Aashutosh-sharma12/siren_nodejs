"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
require("express-async-errors");
const app_1 = __importDefault(require("./routes/app"));
const errors_1 = require("./utils/errors");
const admin_panel_1 = __importDefault(require("./routes/admin-panel"));
const index_1 = __importDefault(require("./routes/admin/index"));
const database_1 = require("./utils/database");
const cors_1 = __importDefault(require("cors"));
require("./utils/cron_job");
const multer_1 = require("./utils/multer");
const app = (0, express_1.default)();
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ quiet: true });
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
/***********************************************************************************
 *                                  Connect DB
 ***********************************************************************************/
(0, database_1.connect)();
/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/
// Use CORS middleware with specified options
app.use((0, cors_1.default)());
// Common middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Use Helmet for security
app.use((0, cookie_parser_1.default)());
// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Security (helmet recommended in express docs)
if (process.env.NODE_ENV === 'production') {
    app.use((0, helmet_1.default)());
}
/***********************************************************************************
 *                         API routes and error handling
 **********************************************************************************/
// Add api router
app.use("/api/v1", app_1.default);
// Admin api router
app.use("/api/v1/admin", index_1.default);
/***********************************************************************************
 *                         API route file upload
 **********************************************************************************/
app_1.default.post('/upload', multer_1.upload.fields([{ name: 'image', maxCount: 1 }]), multer_1.checkFileSize, multer_1.uploadSingleImage, async (req, res) => {
    if (req.imageDetails) {
        return res.status(http_status_codes_1.default.OK).send({ data: { url: req.imageDetails }, code: http_status_codes_1.default.OK, message: 'File uploaded.' });
    }
    else {
        res.status(http_status_codes_1.default.BAD_REQUEST).json({
            error: 'Error in file upload',
            message: 'Error in file upload',
            code: http_status_codes_1.default.BAD_REQUEST
        });
    }
});
// Error handling
app.use((err, req, res, __) => {
    const status = err instanceof errors_1.CustomError ? err.HttpStatus : http_status_codes_1.default.BAD_REQUEST;
    console.log(err, "err-------------------------");
    return res.status(status).json({
        error: err.message,
        message: err.message,
        code: status,
    });
});
/***********************************************************************************
 *                                  Front-end content
 **********************************************************************************/
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.get('/api/v1/about', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public/views', 'abouts.html'));
});
app.get('/api/v1/terms_conditions', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public/views', 'terms_conditions.html'));
});
app.get('/api/v1/contactUs', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public/views', 'contactUs.html'));
});
// Set views dir
const adminViewsDir = path_1.default.join(__dirname, 'public/admin/');
app.set('views', [adminViewsDir]);
// Set static dir
const staticDir = path_1.default.join(__dirname, 'public');
app.use(express_1.default.static(staticDir));
// Serve admin panel files
app.use('/admin', admin_panel_1.default);
// Add api router
app.use("/", (req, res) => {
    res.json("Express server started");
});
exports.default = app;
