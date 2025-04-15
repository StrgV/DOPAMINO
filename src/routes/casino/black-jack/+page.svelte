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
    let balance: number = data.balance;
    let bet_amount: number = 5; // Default bet amount
    let bet_amounts: number[] = [5, 10, 20, 50, 100, 200, 500, 1000, 2500, 5000, balance]; // Possible bet amounts

    let reshuffleAfterRound = false;
    let betPlaced: boolean = false; // Track if a bet has been placed

    $: bet_amounts[bet_amounts.length - 1] = balance; // Ensure the last value in bet_amounts is always the current balance

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
        betPlaced = false; // Reset betPlaced for a new game
        playerHand = [];
        dealerHand = [];
        playerSum = 0;
        dealerSum = 0;

        // Shuffle the deck if necessary
        if (deck.length === 0 || reshuffleAfterRound) {
            deck = createDeck();
            reshuffleAfterRound = false;
        }
    }

    function revealCards() {
        playerHand = [drawCard(), drawCard()];
        dealerHand = [drawCard()];
        calculateSums();
    }

    function calculateSums() {
        playerSum = calculateSum(playerHand); // Calculate the sum of the player's hand
        dealerSum = calculateSum(dealerHand); // Calculate the sum of the dealer's hand
    }

    function hit() {
        if (!betPlaced) {
            message = 'You must place a bet before drawing a card!';
            return;
        }
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
                adjustBalance(+bet_amount * 2); // Update balance when winning
                message = 'Blackjack! You win!'; // Player wins with a sum of 21
                gameOver = true; 
            }
        }
    }
    
    function stand() {
        if (!betPlaced) {
            message = 'You must place a bet before standing!';
            return;
        }
        while (dealerSum < 17) {
            dealerHand.push(drawCard()); // Dealer hits until >= 17
            calculateSums(); // Recalculate the sums the dealer hits
        }

        calculateSums(); // Finalize the sums for both player and dealer
        gameOver = true; // End the game

        if (playerSum > 21) {
            message = 'You busted! Dealer wins!';
        } else if (dealerSum > 21) {
            adjustBalance(+bet_amount * 2); // Update balance when winning
            message = 'Dealer busted! You win!';
        } else if (playerSum === 21 && playerHand.length === 2) {
            // case is already satisfied in hit()
        } else if (dealerSum === 21 && dealerHand.length === 2) {
            message = 'Dealer has Blackjack! Dealer wins!';
        } else if (playerSum > dealerSum) {
            adjustBalance(+bet_amount * 2); // Update balance when winning
            message = 'You win!';
        } else if (playerSum < dealerSum) {
            message = 'Dealer wins!';
        } else if (playerSum === dealerSum) {
            adjustBalance(+bet_amount); // Update balance for a tie
            message = 'It\'s a tie!';
        }

    }
    
    // reset clears everything and starts a new game
    function resetGame() {
        playerHand = [];
        dealerHand = [];
        gameOver = false; 
        message = ''; 
        startGame();
    }

    function bet() {
        if (balance < bet_amount) {
            message = 'Insufficient balance!'; // Prevent betting if balance is too low
            return;
        }

        adjustBalance(-bet_amount); // Update balance when placing a bet
        betPlaced = true; // Mark the bet as placed
        revealCards(); // Reveal the cards and calculate sums
    }

    function increaseBet() {
        const currentIndex = bet_amounts.indexOf(bet_amount);
        if (currentIndex < bet_amounts.length - 1) {
            bet_amount = bet_amounts[currentIndex + 1];
        }
    }

    function decreaseBet() {
        const currentIndex = bet_amounts.indexOf(bet_amount);
        if (currentIndex > 0) {
            bet_amount = bet_amounts[currentIndex - 1];
        }
    }

    // update balance in the database
    async function adjustBalance(amount: number) {
        balance += amount;
        await updateBalanceOnServer(); // speichert's in der DB
    }

    async function updateBalanceOnServer() {
        const res = await fetch('/api/update-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: data.username,
                balance: balance
            })
        });

    const result = await res.json();
    if (!result.success) {
        console.error('Balance-Update fehlgeschlagen:', result.error);
    }
}

// --------------------------- admin / test function -----------------------------
// Reset balance to the initial value
function resetBalance() {
    async function resetBalance() {
        balance = 5000;
        await updateBalanceOnServer(); // speichert's in der DB
    }
    resetBalance();
}
// ---------------------------

    onMount(startGame); // Start the game when the component mounts
</script>

<h1>BLACK JACK</h1>
<p>Welcome to the Black Jack page!</p>

<!-- show the username -->
<p>Logged in as: {data.username}</p>
<p>Balance: {balance} €</p>


<style>
    .game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: sans-serif;
        margin-top: 2rem;
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
            {#if betPlaced}
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
            {:else}
                <span class="card">🂠</span>
                <span class="card">🂠</span>
            {/if}
        </div>
        {#if gameOver}
            <div><strong>Summe:</strong> {dealerSum}</div>
        {/if}
    </div>

    <div class="buttons">
        <button on:click={hit} disabled={gameOver || !betPlaced}>Karte</button>
        
        <div class="player-hand">
            <strong>Spieler:</strong><br />
            <div class="card-row">
                {#if betPlaced}
                    {#each playerHand as c}
                        <span class="card">{c.value}{c.suit}</span>
                    {/each}
                {:else}
                    <span class="card">🂠</span>
                    <span class="card">🂠</span>
                {/if}
            </div>
            {#if betPlaced}
                <div><strong>Summe:</strong> {playerSum}</div>
            {/if}
        </div>
    
        <button on:click={stand} disabled={gameOver || !betPlaced}>Stand</button>
    </div>
    

    <p>{message}</p>
    <div class="buttons">
        <label for="bet">Setze: </label>
        <button on:click={decreaseBet} disabled={bet_amount === bet_amounts[0] || betPlaced}>-</button>
        <span id="bet">${bet_amount}</span>
        <button on:click={increaseBet} disabled={bet_amount === bet_amounts[bet_amounts.length - 1] || betPlaced}>+</button>
        <button on:click={bet} disabled={gameOver || betPlaced}>Setzen</button>
    </div>
    
    <div class="balance">
        Aktueller Kontostand: ${balance} €
    </div>

    {#if gameOver}
        <button on:click={startGame}>Neue Runde</button>
    {/if}
    {#if reshuffleAfterRound}
        <p>Deck wird nach der Runde neu gemischt...</p>
    {/if}

    <div class="buttons">
        <button on:click={resetBalance} disabled={gameOver}>Reset Balance</button>
    </div>  

</div>


<!-- TODO: 
 - add a global store for variables to ensure having the same state in all components
    - add a global store for the balance to ensure having the same state in all components
    - 
 


-->