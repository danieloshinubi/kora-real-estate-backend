'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const swagger_jsdoc_1 = __importDefault(require('swagger-jsdoc'));
const config = {
  hostedUrl: 'https://kora-service.onrender.com/',
  baseUrl: 'http://localhost:5500',
};
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kora Real Estate API',
      version: '1.0.0',
      description: 'API documentation for the Kora platform',
    },
    servers: [
      {
        url: config.hostedUrl,
        description: 'Development server',
      },
    ],
  },
  apis: ['./dist/controllers/*.js'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
