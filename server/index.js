require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const productsRouter = require('./routes/products');
const statsRouter = require('./routes/stats');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/products', productsRouter);
app.use('/api/stats', statsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`💻 NexTech corriendo en http://localhost:${PORT}`);
});
