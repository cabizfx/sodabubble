import { PrismaClient } from '@prisma/client';
import express from 'express';

const app = express();
const port = 3000;

// Disable CORS for now so we can test the API from the frontend
app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

export const prisma = new PrismaClient();
export const apiRouter = express.Router();

apiRouter.use(express.json());

// Get all products
apiRouter.get('/products', async (req, res) => {
    const products = await prisma.product.findMany();
    res.json(products);
});

// Create new order
apiRouter.post('/orders', async (req, res) => {
    const { name, email, productId } = req.body;

    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
    });

    if (!product) {
        res.status(400).send('Invalid product id');
        return;
    }

    const order = await prisma.order.create({
        data: {
            name,
            email,
            productId: product.id,
            total: product.price,
        }
    });

    res.json(order);
});

// All routes should start with /api
app.use('/api', apiRouter);
app.listen(port, () => {
    console.log(`SodaBubbles listening at http://localhost:${port}`);
});