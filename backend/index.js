import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import clientRoute from './routes/client.route.js';
import campaignRoutes from './routes/campaign.routes.js';
import cookieParser from "cookie-parser";


mongoose
    .connect(process.env.MONGO)
    .then(async () => {
        console.log("MongoDB is connected!");
        // Index bakım: cookieNumber üzerindeki unique index'i kaldır (birden fazla siparişe izin ver)
        try {
            const collection = mongoose.connection.collection('orders');
            const indexes = await collection.indexes();
            const cookieIdx = indexes.find((idx) => idx.key && idx.key.cookieNumber === 1);
            if (cookieIdx && cookieIdx.unique) {
                await collection.dropIndex(cookieIdx.name);
                await collection.createIndex({ cookieNumber: 1 });
                console.log('Updated orders.cookieNumber index to non-unique');
            }
        } catch (e) {
            console.warn('Order indexes check failed:', e?.message || e);
        }
    }).catch((err) => {
        console.log(err);
    });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoute);
app.use('/api/campaigns', campaignRoutes);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error!';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});