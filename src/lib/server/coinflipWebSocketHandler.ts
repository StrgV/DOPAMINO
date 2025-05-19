// import type { Server as HttpsServer } from "https";
// import { Server as SocketIOServer, type Socket } from "socket.io";

// // Lobby type
// interface Lobby {
//   hostSocketId: string;
//   guestSocketId: string | null;
//   hostChoice: "Heads" | "Tails";
//   guestChoice: "Heads" | "Tails";
//   state: "waiting" | "playing" | "finished";
//   result: "Heads" | "Tails" | null;
//   winner: "host" | "guest" | null;
// }

// // Multiple Lobbies
// interface Lobbies {
//     [lobbyId: string]: Lobby
// }

// let lobbies: Lobbies = {};

// export function initCointflipSockets(httpsServer: HttpsServer){
//     const io = new SocketIOServer(httpsServer, {
//         cors: {
//             origin: "*",
//             methods: ["GET", "POST"],
//         },
//     });
// }
