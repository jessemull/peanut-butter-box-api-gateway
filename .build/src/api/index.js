"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthcheck_1 = __importDefault(require("./routes/healthcheck"));
const users_1 = __importDefault(require("./routes/users"));
const routes = () => {
    const app = express_1.Router();
    healthcheck_1.default(app);
    users_1.default(app);
    return app;
};
exports.default = routes;
//# sourceMappingURL=index.js.map