import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import clientRoute from './routes/client.route.js';
import campaignRoutes from './routes/campaign.routes.js';
import contactRoutes from './routes/contact.route.js';
import cookieParser from "cookie-parser";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerPath = path.join(__dirname, "openapi.yaml");
const swaggerSpec = YAML.load(swaggerPath);

mongoose
    .connect(process.env.MONGO)
    .then(() => {
        console.log("MongoDB is connected!");
    })
    .catch((err) => {
        console.log(err);
    });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
//app.get("/docs-json", (_, res) => res.json(swaggerSpec));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Swagger UI: http://localhost:${port}/docs`);
    console.log(`OpenAPI JSON: http://localhost:${port}/docs-json`);
});


app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoute);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contact', contactRoutes);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error!';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});
