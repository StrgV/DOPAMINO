import type { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";

// Lobby type
interface Lobby {
  hostSocketId: string;
  guestSocketId: string | null;
  hostChoice: "Heads" | "Tails";
  guestChoice: "Heads" | "Tails";
  state: "waiting" | "playing" | "finished";
  result: "Heads" | "Tails" | null;
  winner: "host" | "guest" | null;
}

// Multiple Lobbies
interface Lobbies {
    [lobbyId: string]: Lobby
}

let lobbies: Lobbies = {};

export function initCointflipSockets(httpServer: HttpServer){
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log(`[Coinflip] Spieler verbunden: ${socket.id}`)

        socket.on("createLobby", () => {
            let lobbyId: string;
            do{
                lobbyId = Math.random().toString(36).substring(2, 8).toUpperCase();
            } while (lobbies[lobbyId]);

            lobbies[lobbyId] = {
                hostSocketId: socket.id,
                guestSocketId: null,
                hostChoice: "Heads",
                guestChoice: "Tails",
                state: "waiting",
                result: null,
                winner: null,
            };
            
            socket.join(lobbyId);
            socket.emit("lobbyCreated", {
                lobbyId: lobbyId,
                playerChoice: lobbies[lobbyId].hostChoice,
            });
            console.log(
                `[Coinflip] Lobby ${lobbyId} erstellt von ${socket.id}. Host wählt Kopf.`
            );
        });

        socket.on("joinLobby", ({ lobbyIdToJoin }: { lobbyIdToJoin: string }) => {
            const lobby = lobbies[lobbyIdToJoin];

            if(!lobby){
                socket.emit("errorFromServer", {
                    message: `Lobby ${lobbyIdToJoin} nicht gefunden.`
                });
                return;
            }
            if (lobby.guestSocketId){
                socket.emit("errorFromServer", {
                    message: `Lobby ${lobbyIdToJoin} ist voll.`
                });
                return;
            }
            if(lobby.hostSocketId === socket.id){
                socket.emit("errorFromServer", {
                    message: `Eigene Lobby nicht betretbar`
                });
                return;
            }
            
            lobby.guestSocketId = socket.id;
            lobby.state = "playing";
            socket.join(lobbyIdToJoin);

            console.log(
                `[Coinflip] Spieler ${socket.id} ist Lobby ${lobbyIdToJoin} beigetreten.`
            )

            io.to(lobby.hostSocketId).emit("playerJoined", {
                message: `Spieler ist beigetreten. Das Spiel beginnt!`,
                opponentChoice: lobby.guestChoice,
            });

            socket.emit("joinedLobbySuccess", {
                lobbyId: lobbyIdToJoin,
                playerChoice: lobby.guestChoice,
                opponentChoice: lobby.hostChoice,
                message: `Du bist Lobby ${lobbyIdToJoin} beigetreten. Das Spiel beginnt!`,
            });
            
            // Spiel starten
            const flipResult = Math.random() < 0.5 ? "Heads" : "Tails";
            lobby.result = flipResult;
            lobby.winner = flipResult === lobby.hostChoice ? "host" : "guest";
            lobby.state = "finished";

            io.to(lobbyIdToJoin).emit("gameOver", {
                result: lobby.result,
                winner: lobby.winner,
                hostChoice: lobby.hostChoice,
                guestChoice: lobby.guestChoice,
            });
            console.log(
                `[Coinflip] Spiel in Lobby ${lobbyIdToJoin} beendet. Ergebnis: ${flipResult}, Gewinner: ${lobby.winner}`,
            );
        });

        socket.on("disconnect", () => {
            console.log(`[Coinflip] Spieler getrennt: ${socket.id}`);
            for (const lobbyId in lobbies) {
                const lobby = lobbies[lobbyId];
                if (
                lobby.hostSocketId === socket.id ||
                lobby.guestSocketId === socket.id
                ) {
                const otherPlayerSocketId =
                    lobby.hostSocketId === socket.id
                    ? lobby.guestSocketId
                    : lobby.hostSocketId;
                if (otherPlayerSocketId) {
                    io.to(otherPlayerSocketId).emit("opponentDisconnected", {
                    message: "Dein Gegner hat das Spiel verlassen.",
                    });
                }
                delete lobbies[lobbyId];
                console.log(
                    `[Coinflip] Lobby ${lobbyId} wegen Trennung geschlossen.`,
                );
                break;
                }
            }
        });
    });
    console.log("[Coinflip] Socket.IO Handler Initialisiert");
}
