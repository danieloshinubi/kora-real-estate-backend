import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';
import connectDB from './migrations';
import { routes } from './routes/main';
import corsOptions from './config/corsOptions';

const app = express();
const server = http.createServer(app);

// Setup CORS and JSON parsing
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Setup routes
routes(app);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Server Running');
});

// Connect to the database
connectDB();

const port = process.env.ACCESS_PORT || 5500;
if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
  });
}

export default app;
