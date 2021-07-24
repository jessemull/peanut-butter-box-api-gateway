"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var express_1 = require("express");
var json = JSON.parse(fs_1.default.readFileSync('./package.json', 'utf8'));
var version = json.version;
var route = express_1.Router();
exports.default = (function (app) {
    app.use('/healthcheck', route);
    route.get('/', function (req, res) {
        res.send(version);
    });
});
//# sourceMappingURL=healthcheck.js.map