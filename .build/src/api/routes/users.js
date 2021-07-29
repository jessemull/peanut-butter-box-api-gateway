"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dynamo_1 = __importDefault(require("../lib/dynamo"));
const logger_1 = __importDefault(require("../lib/logger"));
const USERS_TABLE = process.env.USERS_TABLE || 'users-table-dev';
const route = express_1.Router();
exports.default = (app) => {
    app.use('/users', route);
    route.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            TableName: USERS_TABLE
        };
        try {
            const users = yield dynamo_1.default.scan(params).promise();
            res.json(users.Items);
        }
        catch (error) {
            logger_1.default.error(error);
            res.status(500).json({ error: 'Could not fetch users' });
        }
    }));
    route.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            TableName: USERS_TABLE,
            Key: {
                userId: req.params.userId
            }
        };
        try {
            const data = yield dynamo_1.default.get(params).promise();
            if (data.Item) {
                const { userId, name } = data.Item;
                res.json({ userId, name });
            }
            else {
                res.status(404).json({ error: 'User not found' });
            }
        }
        catch (error) {
            logger_1.default.error(error);
            res.status(500).json({ error: 'Could not fetch user' });
        }
    }));
    route.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { name } = req.body;
        const params = {
            TableName: USERS_TABLE,
            Item: {
                userId: req.params.userId,
                name: name
            },
            ReturnValues: 'ALL_OLD'
        };
        try {
            const user = yield dynamo_1.default.put(params).promise();
            res.json(user.Attributes);
        }
        catch (error) {
            logger_1.default.error(error);
            res.status(500).json({ error: 'Could not create user' });
        }
    }));
    route.put('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, name } = req.body;
        const params = {
            TableName: USERS_TABLE,
            Item: {
                userId: userId,
                name: name
            },
            ReturnValues: 'ALL_OLD'
        };
        try {
            const user = yield dynamo_1.default.put(params).promise();
            res.json(user.Attributes);
        }
        catch (error) {
            logger_1.default.error(error);
            res.status(500).json({ error: 'Could not update user' });
        }
    }));
    route.delete('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            TableName: USERS_TABLE,
            Key: {
                userId: req.params.userId
            },
            ReturnValues: 'ALL_OLD'
        };
        try {
            const data = yield dynamo_1.default.delete(params).promise();
            if (data.Attributes) {
                res.status(200).send();
            }
            else {
                res.status(404).json({ error: 'User not found' });
            }
        }
        catch (error) {
            logger_1.default.error(error);
            res.status(500).json({ error: 'Could not delete user' });
        }
    }));
};
//# sourceMappingURL=users.js.map