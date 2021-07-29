"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const serverless_http_1 = __importDefault(require("serverless-http"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./api/index"));
const error_1 = __importDefault(require("./api/middleware/error"));
const logger_1 = __importDefault(require("./api/middleware/logger"));
const createApp = () => {
    const app = express_1.default();
    app.use(body_parser_1.default.json({ strict: false }));
    app.use(logger_1.default);
    app.use(index_1.default());
    app.use(error_1.default);
    return app;
};
const handler = serverless_http_1.default(createApp());
exports.handler = handler;
//# sourceMappingURL=index.js.map