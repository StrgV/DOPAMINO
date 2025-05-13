<script lang="ts">
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { createDeck, calculateSum, type Card } from './blackjack';
    import { balanceStore, updateBalance } from '$lib/stores/balanceStore';

    // let { data } = $props();
    
    // // Use both local state and subscribe to the store
    // let localBalance = $state(data.balance);
    
    // // Initialize the store with the data from the server
    // onMount(() => {
    //     balanceStore.set(data.balance);
        
    //     // Subscribe to the store to keep local balance in sync
    //     const unsubscribe = balanceStore.subscribe(value => {
    //         localBalance = value;
    //     });
        
    //     return unsubscribe; // Clean up subscription when component unmounts
    // });


    let { data } = $props();

    // Initialize with data.balance instead of 0
    let localBalance = $state(0);

    // Subscribe to the balance store like your other components
    $effect(() => {
        localBalance = $balanceStore;
    });
    
    // Set the initial store value from data
    onMount(() => {
        const currentValue = get(balanceStore);
        if (currentValue === 0) {
            balanceStore.set(data.balance);
        }
    });



    // necessary variables for the game
    let deck = $state<Card[]>([]); 
    let playerHand = $state<Card[]>([]);
    let dealerHand = $state<Card[]>([]);
    let playerSum = $state(0); 
    let dealerSum = $state(0); 
    let gameOver = $state(false); 
    let message = $state(''); 
    
    let bet_amount = $state(5); // Default bet amount
    let bet_amounts = $state([5, 10, 20, 50, 100, 200, 500, 1000, 2500, 5000]); // Possible bet amounts

    let reshuffleAfterRound = $state(false);
    let betPlaced = $state(false); // Track if a bet has been placed

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
        if (localBalance < bet_amount) {
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

    // update balance in the database and store
    async function adjustBalance(amount: number) {
        const newBalance = localBalance + amount;
        // Update the global store which will update both UI and server
        await updateBalance(data.username, newBalance);
    }

    // Reset balance to the initial value
    function resetBalance() {
        updateBalance(data.username, 5000);
    }

    onMount(startGame); // Start the game when the component mounts
</script>

<h1>BLACK JACK</h1>
<p>Welcome to the Black Jack page!</p>

<!-- show the username -->
<p>Logged in as: {data.username}</p>
<p>Balance: {localBalance} €</p>


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
        <button onclick={hit} disabled={gameOver || !betPlaced}>Karte</button>
        
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
    
        <button onclick={stand} disabled={gameOver || !betPlaced}>Stand</button>
    </div>
    

    <p>{message}</p>
    <div class="buttons">
        <label for="bet">Setze: </label>
        <button onclick={decreaseBet} disabled={bet_amount === bet_amounts[0] || betPlaced}>-</button>
        <button onclick={decreaseBet} disabled={bet_amount === bet_amounts[0] || betPlaced}>-</button>
        <span id="bet">${bet_amount}</span>
        <button onclick={increaseBet} disabled={bet_amount === bet_amounts[bet_amounts.length - 1] || betPlaced}>+</button>
        <button onclick={bet} disabled={gameOver || betPlaced}>Setzen</button>
    </div>
    
    <div class="balance">
        Aktueller Kontostand: {localBalance} €
    </div>

    {#if gameOver}
        <button onclick={startGame}>Neue Runde</button>
    {/if}
    {#if reshuffleAfterRound}
        <p>Deck wird nach der Runde neu gemischt...</p>
    {/if}

    <div class="buttons">
        <button onclick={resetBalance} disabled={gameOver}>Reset Balance</button>
    </div>  

</div>