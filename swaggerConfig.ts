import swaggerJSDoc from 'swagger-jsdoc';

const config = {
  hostedUrl: '',
  baseUrl: 'http://localhost:5500',
};

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kora Real Estate API',
      version: '1.0.0',
      description: 'API documentation for the Kora platform',
    },
    servers: [
      {
        url: config.baseUrl,
        description: 'Development server',
      },
    ],
  },
  apis: ['./controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
