// function decideWinner(roomId) {
//   const room = rooms[roomId];
//   if (!room) return "UNKNOWN";

//   // Simple logic for now:
//   // If impostor still exists → impostor wins
//   const roles = Object.values(room.roles);
//   const impostorAlive = roles.includes("IMPOSTOR");

//   return impostorAlive ? "IMPOSTOR_WIN" : "CREWMATE_WIN";
// }

// const rooms = {};

module.exports = (io, socket) => {};

//   socket.on("join-room", ({ roomId, username }) => {
//     if (!rooms[roomId]) {
//       rooms[roomId] = {
//         users: [],
//         roles: {},
//         gameStarted: false,
//         winner: null
//       };
//     }

//     rooms[roomId].users.push({
//       id: socket.id,
//       username
//     });

//     socket.join(roomId);

//     io.to(roomId).emit("room-update", rooms[roomId].users);
//   });

//   socket.on("start-game", ({ roomId }) => {
//     const users = rooms[roomId].users;
//     if (users.length < 3) return;

//     const impostorIndex = Math.floor(Math.random() * users.length);
//     const impostorId = users[impostorIndex].id;

//     users.forEach(u => {
//       rooms[roomId].roles[u.id] =
//         u.id === impostorId ? "IMPOSTOR" : "CREWMATE";

//       // send private role
//       io.to(u.id).emit("your-role", rooms[roomId].roles[u.id]);
//     });

//     rooms[roomId].gameStarted = true;
//   });

//   socket.on("end-game", ({ roomId }) => {
//     const result = decideWinner(roomId); // your logic
//     io.to(roomId).emit("game-over", {
//         result,
//         roles: rooms[roomId].roles,
//         users: rooms[roomId].users
//     });
//     });

//   socket.on("disconnect", () => {
//     for (const roomId in rooms) {
//       rooms[roomId].users = rooms[roomId].users.filter(
//         u => u.id !== socket.id
//       );
//       delete rooms[roomId].roles[socket.id];
//     }
//   });
// };

//     socket.on("sync-users", ({ roomId }) => {
//      if (rooms[roomId]) socket.emit("user-list-update", rooms[roomId].users);
//     });
