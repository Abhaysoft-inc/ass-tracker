import app from './app';
import { registerRoutes } from './routes';

const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

registerRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
