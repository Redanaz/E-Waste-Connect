const express = require('express');
const cors = require('cors');
const path = require('path');
const { HttpError, errorHandler } = require('./utils/errors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/geo', require('./routes/geo'));
app.use('/api/centers', require('./routes/centers'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', (req, res, next) => next(new HttpError(404, 'Not found')));

app.use(errorHandler);
module.exports = app;
