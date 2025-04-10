<script lang="ts">

    export let data: {
        username: string;
        balance: number; 
    }

    import { onMount } from 'svelte'; // similar to $effect but runs only once
    import { createDeck, calculateSum, type Card } from './blackjack'; // Import the functions and type Card from blackjack logic
    
    // necessary variables for the game
    let deck: Card[] = []; 
    let playerHand: Card[] = [];
    let dealerHand: Card[] = [];
    let playerSum: number = 0; 
    let dealerSum: number = 0; 
    let gameOver: boolean = false; 
    let message: string = ''; 
    // user from database
    let user = '';
    let balance: number = 0; 
    
    // let bet: number = 0; // Variable to hold the player's bet amount
    // let betAmount: number = 0; // Variable to hold the bet amount input by the player
    
    let reshuffleAfterRound = false;

    function drawCard(): Card {
        // After reaching last third of the deck -> shuffle the deck
        if (deck.length < Math.floor(52 * 1 / 3)) {
            reshuffleAfterRound = true;
        }
        return deck.pop()!;
    }


    function startGame() {
        gameOver = false;
        message = '';

        // Nur bei der ersten Runde oder nach Schneidekarte neu mischen
        if (deck.length === 0 || reshuffleAfterRound) {
            deck = createDeck();
            reshuffleAfterRound = false;
        }

        playerHand = [drawCard(), drawCard()];
        dealerHand = [drawCard()];
        calculateSums();
    }


    function calculateSums() {
        playerSum = calculateSum(playerHand); // Calculate the sum of the player's hand
        dealerSum = calculateSum(dealerHand); // Calculate the sum of the dealer's hand
    }

    function hit() {
        if (!gameOver) {
            const newCard = drawCard();
            playerHand = [...playerHand, newCard]; // force a new reference (push wasn't reactive)
            console.log('Current Hand:', playerHand.map(c => c.value + c.suit));
            calculateSums(); // Recalculate the sums after hitting
            if (playerSum > 21) {
                message = 'You busted! Dealer wins!'; // Player loses if sum exceeds 21
                gameOver = true; 
            }
            else if (playerSum === 21) {
                message = 'Blackjack! You win!'; // Player wins with a sum of 21
                gameOver = true; 
            } else {
                message = 'Hit or Stand?'; // Prompt for next action
            }
        }
    }
    
    function stand() {
        while (dealerSum < 17) {
            dealerHand.push(drawCard()); // Dealer hits until >= 17
            calculateSums(); // Recalculate the sums the dealer hits
        }

        calculateSums(); // Finalize the sums for both player and dealer
        gameOver = true; // End the game

        if (playerSum > 21) {
            message = 'You busted! Dealer wins!';
        } else if (dealerSum > 21) {
            message = 'Dealer busted! You win!';
        } else if (playerSum === 21 && playerHand.length === 2) {
            message = 'Blackjack! You win!';
        } else if (dealerSum === 21 && dealerHand.length === 2) {
            message = 'Dealer has Blackjack! Dealer wins!';
        } else if (playerSum > dealerSum) {
            message = 'You win!';
        } else if (playerSum < dealerSum) {
            message = 'Dealer wins!';
        } else if (playerSum === dealerSum) {
            message = 'It\'s a tie!';
        }

        // Update the balance based on the outcome
    }
    
    // reset clears everything and starts a new game
    function resetGame() {
        playerHand = [];
        dealerHand = [];
        gameOver = false; 
        message = ''; 
        startGame();
    }

    onMount(startGame); // Start the game when the component mounts
</script>

<h1>BLACK JACK</h1>
<p>Welcome to the Black Jack page!</p>

<!-- shwo the username -->
<p>Logged in as: {data.username}</p>
<p>Balance: {data.balance} €</p>



<style>
    .game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: sans-serif;
        margin-top: 2rem;
    }

    .hand {
        margin: 1rem;
        font-size: 1.5rem;
    }

    .buttons {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
        margin: 1rem 0;
    }
    .player-hand {
        text-align: center;
        min-width: 80px;
    }
    .balance {
        position: absolute;
        bottom: 10px;
        left: 10px;
        font-weight: bold;
    }

    .card-row {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .card {
        padding: 0.25rem 0.5rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        background: white;
        color: black;
        font-weight: bold;
    }

    .dealer-hand {
        text-align: center;
        margin-bottom: 1rem;
    }

</style>

<div class="game-container">
    <p style="position: absolute; top: 10px; right: 10px;">
        Karten im Deck: {deck.length}
      </p>
      <div class="dealer-hand">
        <strong>Dealer:</strong><br />
        <div class="card-row">
            {#if gameOver}
                {#each dealerHand as c}
                    <span class="card">{c.value}{c.suit}</span>
                {/each}
            {:else}
                {#if dealerHand[0]}
                    <span class="card">{dealerHand[0].value}{dealerHand[0].suit}</span>
                    <span class="card">🂠</span> <!-- verdeckte Karte -->
                {/if}
            {/if}
        </div>
        {#if gameOver}
            <div><strong>Summe:</strong> {dealerSum}</div>
        {/if}
    </div>

    <div class="buttons">
        <button on:click={hit} disabled={gameOver}>Karte</button>
        
        <div class="player-hand">
            <strong>Spieler:</strong><br />
            <div class="card-row">
                {#each playerHand as c}
                    <span class="card">{c.value}{c.suit}</span>
                {/each}
            </div>
            <div><strong>Summe:</strong> {playerSum}</div>
        </div>
    
        <button on:click={stand} disabled={gameOver}>Stand</button>
    </div>
    

    <p>{message}</p>
    <div class="balance">Bank: ${balance}</div>

    {#if gameOver}
        <button on:click={startGame}>Neue Runde</button>
    {/if}
    {#if reshuffleAfterRound}
        <p>Deck wird nach der Runde neu gemischt...</p>
    {/if}
</div>
