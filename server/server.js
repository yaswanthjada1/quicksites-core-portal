import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import onboardingRouter from './routes/onboarding.js';
import chatRouter from './routes/chat.js';
import pinboardRouter from './routes/pinboard.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/chat', chatRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/pinboard', pinboardRouter);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'green',
        message: 'QuickSites Core Portal Backend running smoothly.'
    });
});

const DEFAULT_PORT = process.env.PORT || 5000;

function startServer(port = DEFAULT_PORT) {
    const server = app.listen(port, () => {
        console.log("\n[1] ============== QUICKSITES CORE PORTAL ==============");
        console.log(`[1] 🚀 Server listening natively on port: ${port}`);
        console.log(`[1] 📡 Backend API Gateway:   \x1b[36mhttp://localhost:${port}\x1b[0m`);
        console.log(`[1] 💻 Frontend Client Core:  \x1b[32mhttp://localhost:5173\x1b[0m`);
        console.log("[1] ====================================================\n");
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  Port ${port} is occupied. Shifting fallback route...`);
            startServer(Number(port) + 1);
        } else {
            console.error('Server execution error:', err);
        }
    });
}

startServer(DEFAULT_PORT);
