import app from './app';
import config from './src/config';

// Start the server
const port = Number(config.localPort);
app.listen(port, '0.0.0.0');

console.log(`App running, hosted at http://localhost:${port}`);
