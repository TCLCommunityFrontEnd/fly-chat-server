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


let userSocketMap = {};
http.listen(3012,function(){
  console.log('listening on *:3012');
});
io.on('connection',function(socket){
  console.log('an user connected');
  //如果当前映射列表里没有该socketId,则要求客户端再次发送相关信息进行绑定。
  if(Object.values(userSocketMap).indexOf(socket.id)<0){
    io.emit('server-bind-user',{});
  }
  socket.on('message',function(data){
    const targetSocketId = userSocketMap[data.recvId];
    console.log(targetSocketId)
    if (io.sockets.connected[targetSocketId]) {
      var params = {
          type:data.type,
          typeId:data.sendId,//好像用不到
          userId:data.sendId,
          content:data.content,
          time:data.time
      }
      // io.send(params);
      io.sockets.connected[targetSocketId].emit('message',params);
    }
  });
  //建立新的映射
  socket.on('newUser',function(data){
    userSocketMap[data.id] = socket.id;
    refreshUserStatus();
  });
  socket.on('disconnect',function(reason){
    if (reason === 'io server disconnect') {
      socket.connect();
    }else{
      //可能是客户端浏览器关闭
      const key = Object.keys(userSocketMap).find((o)=>userSocketMap[o]==socket.id);
      delete userSocketMap[key];
      refreshUserStatus();
    }
  });
  function refreshUserStatus(){
    //io.sockets.emit包含当前客户端，socket.emit不包含当前客户端
    io.sockets.emit('server-refresh-user-status',Object.keys(userSocketMap));
  }
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
