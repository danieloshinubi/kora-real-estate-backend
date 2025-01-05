"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const auth_1 = require("./auth");
const propertyType_1 = require("./propertyType");
const profile_1 = require("./profile");
const user_1 = require("./user");
const routes = (app) => {
    app.use('/auth', auth_1.router);
    app.use('/property-types', propertyType_1.router);
    app.use('/profile', profile_1.router);
    app.use('/user', user_1.router);
};
exports.routes = routes;
