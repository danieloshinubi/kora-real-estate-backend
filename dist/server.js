"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerConfig_1 = __importDefault(require("./swaggerConfig"));
const migrations_1 = __importDefault(require("./migrations"));
const main_1 = require("./routes/main");
const corsOptions_1 = __importDefault(require("./config/corsOptions"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Setup CORS and JSON parsing
app.use((0, cors_1.default)(corsOptions_1.default));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve Swagger docs
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.default));
// Setup routes
(0, main_1.routes)(app);
// Root route
app.get('/', (req, res) => {
    res.send('Server Running');
});
// Connect to the database
(0, migrations_1.default)();
const port = process.env.ACCESS_PORT || 5500;
if (process.env.NODE_ENV !== 'test') {
    server.listen(port, () => {
        console.log(`Server running on port ${port}.`);
    });
}
exports.default = app;
