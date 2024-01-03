import io from "./socket.js";

class WebSockets {
  onlineUsers = [];
  connection(socket) {
    console.log("Client connected: ", socket.id);
    if (!this.onlineUsers) {
      this.onlineUsers = Array();
    }
    socket.on("addNewUser", (userId) => {
      if (!this.onlineUsers) {
        this.onlineUsers = Array();
      }
      !this.onlineUsers.some((user) => user.userId === userId) &&
        this.onlineUsers.push({
          userId,
          socketId: socket.id,
        });
      io.getIO().emit("getOnlineUsers", this.onlineUsers);
    });

    socket.on("sendMessage", (message) => {
      const user = this.onlineUsers.find(
        (user) => user.userId === message.recipientId
      );

      if (user) {
        io.getIO().to(user.socketId).emit("getMessage", message);
        io.getIO().to(user.socketId).emit("getNotification", {
          postedByUser: message.postedByUser,
          isRead: false,
          date: new Date(),
        });
      }
    });

    socket.on("createChat", (data) => {
      const user = this.onlineUsers.find(
        (user) => user.userId === data.recipientId
      );
      if (user) {
        io.getIO().to(user.socketId).emit("getNewChat", data);
      }
    });

    socket.on("changeInfo", (data) => {
      io.getIO().broadcast.emit("getChangeInfo", data);
    });

    socket.on("sendcall", (data) => {
      const user = this.onlineUsers.find(
        (user) => user.userId === data.data.id
      );
      if (user) {
        io.getIO().to(user.socketId).emit("getcall", data);
      }
    });

    socket.on("rejectcall", (data) => {
      const user = this.onlineUsers.find((user) => user.userId === data.id);
      if (user) {
        io.getIO().to(user.socketId).emit("getrejectcall", data);
      }
    });

    socket.on("answercall", (data) => {
      const user = this.onlineUsers.find((user) => user.userId === data.id);
      if (user) {
        io.getIO().to(user.socketId).emit("callaccepted", data.signal);
      }
    });

    socket.on("callUser", (data) => {
      const user = this.onlineUsers.find(
        (user) => user.userId === data.data.id
      );
      if (user) {
        io.getIO().to(user.socketId).emit("callUser", {
          signal: data.signalData,
          from: data.from,
          name: data.name,
        });
      }
    });

    socket.on("answerCallTest", (data) => {
      const user = this.onlineUsers.find((user) => user.userId === data.id);
      if (user) {
        io.getIO().to(user.socketId).emit("callAcceptedTest", data.signal);
      }
    });

    socket.on("leaveCall", (data) => {
      const user = this.onlineUsers.find((user) => user.userId === data.id);
      if (user) {
        io.getIO().to(user.socketId).emit("leaveCall", data);
      }
    });

    socket.on("disconnect", () => {
      this.onlineUsers = this.onlineUsers.filter(
        (user) => user.socketId !== socket.id
      );
      io.getIO().emit("getOnlineUsers", this.onlineUsers);
    });
  }
}

export default new WebSockets();
