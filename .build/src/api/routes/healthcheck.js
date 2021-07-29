"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const express_1 = require("express");
const json = JSON.parse(fs_1.default.readFileSync('./package.json', 'utf8'));
const version = json.version;
const route = express_1.Router();
exports.default = (app) => {
    app.use('/healthcheck', route);
    route.get('/', function (req, res) {
        res.send(version);
    });
};
//# sourceMappingURL=healthcheck.js.map