"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        mongoose_1.default.set('strictQuery', false);
        const connectOptions = {
        // Add other options if needed, e.g., 'dbName' or 'autoIndex'
        };
        const connect = await mongoose_1.default.connect(process.env.DB_URL, connectOptions);
        console.log('MongoDB connected: ', connect.connection.host);
    }
    catch (err) {
        console.error(err);
    }
};
exports.default = connectDB;
