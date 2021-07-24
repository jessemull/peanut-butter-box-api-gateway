"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var healthcheck_1 = __importDefault(require("./routes/healthcheck"));
var users_1 = __importDefault(require("./routes/users"));
var routes = function () {
    var app = express_1.Router();
    healthcheck_1.default(app);
    users_1.default(app);
    return app;
};
exports.default = routes;
//# sourceMappingURL=index.js.map