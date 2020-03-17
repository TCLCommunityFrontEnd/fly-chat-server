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
var helper = require('./db/helper.js');
var chatSql = require('./db/chatSql.js');


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
    }else{
      var _params = {
        type:data.type,
        sender:data.sendId,
        receiver:data.recvId,
        content:data.content
      }
      helper.queryArgs(chatSql.insert,Object.values(_params));
    }
  });
  //建立新的映射
  socket.on('newUser',function(data){
    if(userSocketMap[data.id]===undefined){
      userSocketMap[data.id] = socket.id;
      refreshUserStatus();
      //查询未接收的信息
      helper.queryArgs(chatSql.query,[data.id],function(result){
        result.forEach(o=>{
          var returnData = {
            type:o.type,
            typeId:o.sender,//好像用不到
            userId:o.sender,
            content:o.content,
            time:new Date(o.timeStamp)
          }
          io.sockets.connected[socket.id].emit('message',returnData)
        })
        helper.queryArgs(chatSql.delete,[data.id]);
      })
    }
  });
  socket.on('disconnect',function(reason){
    // if (reason === 'io server disconnect') {
    //   socket.connect();
    // }else{
    //   //可能是客户端浏览器关闭
    //   const key = Object.keys(userSocketMap).find((o)=>userSocketMap[o]==socket.id);
    //   delete userSocketMap[key];
    //   refreshUserStatus();
    // }
    const key = Object.keys(userSocketMap).find((o)=>userSocketMap[o]==socket.id);
    delete userSocketMap[key];
    refreshUserStatus();
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
