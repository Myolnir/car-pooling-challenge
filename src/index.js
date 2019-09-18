const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const catalog = require('./routes/catalog');
const container = require('./boot');
const config = container.resolve('config');
const logger = require('./util/logger');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/', catalog);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});
// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const server = app.listen(config.port, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`App listening at http://${host}:${port}`);
});
