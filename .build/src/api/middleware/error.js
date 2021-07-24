"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __importDefault(require("../../lib/logger"));
var errorMiddleware = function (err, req, res, next) {
    logger_1.default.error(err);
    res.status(err.status || 500);
    res.json({
        errors: {
            message: err.message
        }
    });
};
exports.default = errorMiddleware;
//# sourceMappingURL=error.js.map