import { io } from "socket.io-client";

document.addEventListener('DOMContentLoaded', async function() {
  const joinRoomButton = document.querySelector("#room-button");
  const messageInput = document.querySelector("#message-input");
  const roomInput = document.querySelector("#room-input");
  const form = document.querySelector("#form");
  
  const socket = io("http://localhost:5500");
  const userSocket = io("http://localhost:5500/user", { auth: { token: "A" } });
  
  socket.on('connect', () => {
    displayMessage(`You conncted with id: ${socket.id}`);
  }) 


  // 에러메세지는 아래와 같이 받음
  userSocket.on("connect_error", (error) => {
    displayMessage(error);
  })

  // ### custom event만들 수 있으며, 아무 값이나 줄 수 있음
  // socket.emit('custom-event', 10, 'Hi', {a: 'a'})
  
  socket.on('receive-message', (message) => {
    console.log(`message = ${message}`);
    displayMessage(message);
  })
  
  // ### form 제출 이벤트 리스너
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const room = roomInput.value        

    if (message == "") return
    displayMessage(message);
    socket.emit('send-message', message, room);

    messageInput.value = "";
  })
  
  
  // ### 방 join버튼 이벤트 리스너
  joinRoomButton.addEventListener("click", () => {
    const room = roomInput.value;
    // ### callback function까지 넘겨줄 수 있음!
    //-> callback은 항상 마지막 argument여야 함
    socket.emit('join-room', room, (message) => {
      displayMessage(message);
    });
  })
  
  function displayMessage(message) {
    const div = document.createElement("div");
    div.textContent = message;
    document.querySelector("#message-container").append(div);
  }


  // 연결여부 보기 위한 setInterval
  let count = 0;
  setInterval(() => {
    console.log("11");
    // socket.emit('ping', ++count);
    socket.volatile.emit("ping", ++count);
  }, 1000)


  // socket io는 default설정으로는 disconnect을 한 상태로 emit으로 메세지 보내면, socket io가 메세지들을 저장해서 다시 connect되면 한번에 보냄..
  // volatile flag를 사용하면, 만약 보내지 못할 상황이면 그냥 안 보내고 맘 -> 리소스 관리에 유리
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input')) return

    if (e.key == 'c') socket.connect();

    if(e.key == 'd') socket.disconnect();
  })

})