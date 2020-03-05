var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(3005,function(){
  console.log('listening on *:3005');
});
io.on('connection',function(socket){
  socket.on('message',function(data){
      var returnMsg = '';
      switch(data.type){
          case 'SINGLE':
              returnMsg = 'hi~';
              break;
          case 'ORG':
              break;
          case 'GROUP':
              break;
      };
      var params = {
          type:data.type,
          typeId:data.id,
          userId:0,
          content:returnMsg,
          time:new Date().getTime()
      }
      io.send(params);
  })
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
