// admin ui 사용
const { instrument } = require("@socket.io/admin-ui");

const io = require("socket.io")(5500, {
  cors: {
    origin: ['http://localhost:8080', 'https://admin.socket.io'],
    // methods: ["GET", "POST"],
    credentials: true
  }
});

// admin ui사용 방법
instrument(io, {
  auth: false
})

// Namespace사용 방법
const userIo = io.of("/user");

io.on("connection", (socket) => {
  console.log(socket.id);

  // custom event에서 emit온 데이터 아래와 같이 볼 수 있음
  // socket.on('custom-event', (number, string, obj) => {
  //   console.log(`custom-event불림. number = ${number}, string = ${string}, obj = ${JSON.stringify(obj)}`);
  // })

  socket.on('send-message', (message, room) => {
    // console.log(message);
    // broadcast사용하면 current socket제외하고 보냄
    if (room == '') {
      socket.broadcast.emit("receive-message", message);    
    } else {
      socket.to(room).emit("receive-message", message);
    }
  })

  // 방 join하는 방법
  socket.on('join-room', (room, cb) => {
    socket.join(room);
    cb(`Joined ${room}`);
  })


  socket.on('ping', n => console.log(n))
});


userIo.on("connection", (socket) => {
  console.log(`Connected to user namespace. socke id: ${socket.id}, username: ${socket.username}`);
})

// middleware 사용
//-> callback함수는 2개의 아규먼트 받음.. 항상 socket, next
userIo.use((socket, next) => {
  if (socket.handshake.auth.token) {
    socket.username = getUsernameFromToken(socket.handshake.auth.token);
    next();
  } else {
    next(new Error("Please send token"))
  }
});


function getUsernameFromToken (token) {
  return token;
}
