const http = require('http');
const app = require('./app');
const startMediaCleanupJob = require('../jobs/mediaCleanupJob');
const { setupWebSocket } = require('./websocket');
require('dotenv').config();

const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 5000;

startMediaCleanupJob();

server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(` Сервер запущен!`);
  console.log(` Локально: http://localhost:${PORT}`);
  console.log(` В сети: http://${require('os').hostname()}:${PORT}`);
  console.log(` Время: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
});
