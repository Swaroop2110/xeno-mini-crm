import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './db';
import { seedRouter } from './routes/seed';
import { segmentsRouter } from './routes/segments';
import { receiptRouter } from './routes/receipt';
import { campaignsRouter } from './routes/campaigns';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/seed', seedRouter);
app.use('/api/segments', segmentsRouter);
app.use('/api/receipt', receiptRouter);
app.use('/api/campaigns', campaignsRouter);

const startServer = async () => {
  if (process.env.MONGODB_URI) {
    await connectDB(process.env.MONGODB_URI);
  } else {
    console.warn('⚠️ No MONGODB_URI found in .env. Skipping database connection for now.');
  }

  app.listen(PORT, () => {
    console.log(`CRM Backend running on port ${PORT}`);
  });
};

startServer();
