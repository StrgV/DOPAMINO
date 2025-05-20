<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { io as socketIOClient, type Socket } from 'socket.io-client'; // Importiere Socket-Typ

  // Typdefinitionen für die Daten, die über Sockets ausgetauscht werden
  // Diese könnten auch in einer separaten types.ts Datei liegen und importiert werden
  interface LobbyCreatedData {
    lobbyId: string;
    playerChoice: 'Heads' | 'Tails';
  }

  interface PlayerJoinedData {
    message: string;
    opponentChoice: 'Heads' | 'Tails';
  }

  interface JoinedLobbySuccessData {
    lobbyId: string;
    playerChoice: 'Heads' | 'Tails';
    opponentChoice: 'Heads' | 'Tails';
    message: string;
  }

  interface GameOverData {
    result: 'Heads' | 'Tails';
    winner: 'host' | 'guest';
    hostChoice: 'Heads' | 'Tails';
    guestChoice: 'Heads' | 'Tails';
  }

  interface ErrorFromServerData {
    message: string;
  }

  interface OpponentDisconnectedData {
    message: string;
  }

  interface Message {
    text: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'emphasis';
    id: number;
  }

  type GamePhase = 'initial' | 'waitingForPlayer' | 'playing' | 'finished';
  type PlayerChoice = 'Heads' | 'Tails' | '';

  // const SERVER_URL = 'http://localhost:3000'; // Backend Server URL

  let socket: Socket; // Typ für die Socket-Instanz
  let connectionStatus: string = $state('Verbinde...');
  let currentLobbyId: string = $state('');
  let inputLobbyId: string = $state(''); // Für das Beitreten
  let isHost: boolean = $state(false);
  let playerChoice: PlayerChoice = $state('');
  let opponentChoice: PlayerChoice = $state('');
  let gamePhase: GamePhase = $state('initial');
  let flipResult: 'Heads' | 'Tails' | '' = $state('');
  let winnerMessage: string = $state('');
  let messages: Message[] = $state([]); // Log-Nachrichten mit Typ

  function addMessage(text: string, type: Message['type'] = 'info'): void {
    messages = [...messages, { text, type, id: Date.now() + Math.random() }];
    if (messages.length > 10) messages.shift(); // Begrenze Anzahl Nachrichten
  }

  onMount(() => {
    // Wenn der WebSocket-Server auf demselben Host/Port wie die SvelteKit-App läuft,
    // kann SERVER_URL weggelassen werden: socket = socketIOClient();
    socket = socketIOClient();

    socket.on('connect', () => {
      connectionStatus = 'Verbunden';
      addMessage('Erfolgreich mit dem Server verbunden.', 'success');
    });

    socket.on('disconnect', () => {
      connectionStatus = 'Verbindung getrennt';
      addMessage('Verbindung zum Server getrennt.', 'error');
      // resetGame(); // Optional: Spielzustand aggressiver zurücksetzen
    });

    socket.on('errorFromServer', (data: ErrorFromServerData) => {
      addMessage(`Server Fehler: ${data.message}`, 'error');
    });

    socket.on('lobbyCreated', (data: LobbyCreatedData) => {
      currentLobbyId = data.lobbyId;
      playerChoice = data.playerChoice;
      opponentChoice = playerChoice === 'Heads' ? 'Tails' : 'Heads'; // Gegner hat die andere Wahl
      isHost = true;
      gamePhase = 'waitingForPlayer';
      addMessage(`Lobby ${currentLobbyId} erstellt. Du hast ${playerChoice}. Warte auf Gegner...`, 'info');
    });

    socket.on('playerJoined', (data: PlayerJoinedData) => { // Für den Host
      if (isHost) {
        opponentChoice = data.opponentChoice;
        addMessage(`${data.message} Gegner hat ${opponentChoice}.`, 'info');
        gamePhase = 'playing';
      }
    });

    socket.on('joinedLobbySuccess', (data: JoinedLobbySuccessData) => { // Für den Gast
      currentLobbyId = data.lobbyId;
      playerChoice = data.playerChoice;
      opponentChoice = data.opponentChoice;
      isHost = false;
      gamePhase = 'playing';
      addMessage(`${data.message} Du hast ${playerChoice}. Gegner hat ${opponentChoice}.`, 'info');
    });

    socket.on('gameOver', (data: GameOverData) => {
      flipResult = data.result;
      gamePhase = 'finished';
      addMessage(`Münzwurf: ${flipResult}!`, 'emphasis');

      let localWinner: string = '';
      if (isHost && data.winner === 'host') {
        localWinner = 'Du';
      } else if (!isHost && data.winner === 'guest') {
        localWinner = 'Du';
      } else {
        localWinner = 'Dein Gegner';
      }
      const winningChoice = localWinner === 'Du' ? playerChoice : opponentChoice;
      winnerMessage = `${localWinner} hat gewonnen! (${data.result} war ${winningChoice})`;
      addMessage(winnerMessage, 'success');
    });

    socket.on('opponentDisconnected', (data: OpponentDisconnectedData) => {
      addMessage(data.message, 'warning');
      resetGame();
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  });

  function createLobby(): void {
    if (socket && socket.connected) {
      socket.emit('createLobby');
      addMessage('Erstelle Lobby...', 'info');
    } else {
      addMessage('Keine Verbindung zum Server.', 'error');
    }
  }

  function joinLobby(): void {
    if (socket && socket.connected && inputLobbyId.trim()) {
      socket.emit('joinLobby', { lobbyIdToJoin: inputLobbyId.trim().toUpperCase() });
      addMessage(`Versuche Lobby ${inputLobbyId.trim().toUpperCase()} beizutreten...`, 'info');
    } else if (!inputLobbyId.trim()){
      addMessage('Bitte gib eine Lobby-ID ein.', 'warning');
    } else {
      addMessage('Keine Verbindung zum Server.', 'error');
    }
  }

  function resetGame(): void {
    currentLobbyId = '';
    inputLobbyId = '';
    isHost = false;
    playerChoice = '';
    opponentChoice = '';
    gamePhase = 'initial';
    flipResult = '';
    winnerMessage = '';
    addMessage('Spiel zurückgesetzt. Bereit für eine neue Runde.', 'info');
  }

</script>

<div class="content">
  <p>Verbindungsstatus: <span class="status-{connectionStatus.toLowerCase().replace(' ', '-')}">{connectionStatus}</span></p>

  {#if gamePhase === 'initial'}
    <div class="actions">
      <button onclick={createLobby}>Neue Lobby erstellen (Du wählst Heads)</button>
      <div class="join-lobby">
        <input type="text" bind:value={inputLobbyId} placeholder="Lobby ID" maxlength="6" />
        <button onclick={joinLobby}>Lobby beitreten</button>
      </div>
    </div>
  {/if}

  {#if currentLobbyId}
    <div class="lobby-info">
      <h2>Lobby: {currentLobbyId}</h2>
      <p>Du bist: <strong>{isHost ? 'Host' : 'Gast'}</strong></p>
      {#if playerChoice}
        <p>Deine Wahl: <strong>{playerChoice}</strong></p>
      {/if}
      {#if opponentChoice}
        <p>Gegnerische Wahl: <strong>{opponentChoice}</strong></p>
      {/if}
    </div>
  {/if}

  {#if gamePhase === 'waitingForPlayer'}
    <p class="waiting-message">Warte auf einen Mitspieler...</p>
  {/if}

  {#if gamePhase === 'playing'}
    <p class="playing-message">Spiel läuft... Münze wird geworfen!</p>
  {/if}

  {#if gamePhase === 'finished'}
    <div class="results">
      <h3>Ergebnis des Wurfs: <span class="flip-result">{flipResult}</span></h3>
      <h2 class="winner-message {winnerMessage.includes('Du') ? 'win' : 'lose'}">{winnerMessage}</h2>
      <button onclick={resetGame}>Neues Spiel / Lobby verlassen</button>
    </div>
  {/if}

  <div class="stat-container">
    <h2>Log</h2>
    {#each messages as msg (msg.id)}
      <p class="message-{msg.type}">{msg.text}</p>
    {/each}
  </div>
</div>

<style>
  .status-verbunden { color: green; font-weight: bold; }
  .status-verbinde_ { color: orange; }   
  .status-verbindung-getrennt { color: red; font-weight: bold; }

  .actions, .join-lobby, .lobby-info, .results {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .join-lobby {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  .join-lobby button {
    background-color: var(--primary-color);
  }
  .join-lobby button:hover {
    background-color: #1e7e34;
  }
  .results button {
    background-color: #6c757d;
  }
  .results button:hover {
    background-color: #545b62;
  }


  .waiting-message, .playing-message {
    font-style: italic;
    color: #555;
    margin: 20px 0;
  }

  .flip-result {
    font-weight: bold;
    font-size: 1.5em;
    color: #dc3545; /* War vorher rot, kann man anpassen */
  }

  .winner-message {
    font-size: 1.3em;
    margin-top: 10px;
  }
  .winner-message.win { color: #28a745; }
  .winner-message.lose { color: #dc3545; }

  .message-info { color: #00529B; background-color: #BDE5F8; }
  .message-success { color: #4F8A10; background-color: #DFF2BF; }
  .message-warning { color: #9F6000; background-color: #FEEFB3; }
  .message-error { color: #D8000C; background-color: #FFD2D2; }
  .message-emphasis { font-weight: bold; color: #555; }

</style>
