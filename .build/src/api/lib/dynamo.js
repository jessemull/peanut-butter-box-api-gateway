"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const client = new aws_sdk_1.default.DynamoDB.DocumentClient();
exports.default = client;
//# sourceMappingURL=dynamo.js.map