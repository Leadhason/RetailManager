import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.json({ message: 'RetailManager API running!' }));

// Add your API routes here
// Example: app.use('/api/products', productRoutes);

export { app };
