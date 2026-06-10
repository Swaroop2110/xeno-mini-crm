import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { dispatchRouter } from './routes/dispatch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json({ limit: '10mb' })); // Allow large batches
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'channel-simulator' });
});

// Dispatch endpoint
app.use('/dispatch', dispatchRouter);

app.listen(PORT, () => {
  console.log(`Channel Simulator Service running on port ${PORT}`);
});
