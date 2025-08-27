import app from './app';
import { registerRoutes } from './routes';

const PORT = process.env.PORT || 3000;


registerRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
