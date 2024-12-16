"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const auth_1 = require("./auth");
const routes = (app) => {
    app.use('/auth', auth_1.router);
};
exports.routes = routes;
