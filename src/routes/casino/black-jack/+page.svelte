<script lang="ts">
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { createDeck, calculateSum } from './blackjack';
    import { type Card } from '$lib/types/card'
    import { balanceStore, updateBalance } from '$lib/stores/balanceStore';
	import Hand from '$lib/components/Hand.svelte';

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

    // preload all card images
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'Q', 'K'];
    const suits = ['♥️', '♦️', '♣️', '♠️']; // Use the same suit characters as your Card component expects

    // Function to convert suit characters to the format used in filenames
    function suitToChar(suit: string): string {
        switch (suit) {
            case '♥️': return 'H';
            case '♦️': return 'D';
            case '♣️': return 'C';
            case '♠️': return 'S';
            default: return 'backside'; 
        }
    }

    // Generate an array of all 53 card image paths
    const allCardImagePaths: string[] = [];
    allCardImagePaths.push(`/Cards/Card_backside.svg`);
    for (const value of values) {
        for (const suit of suits) {
            allCardImagePaths.push(`/Cards/Card_${value}${suitToChar(suit)}.svg`);
        }
    }    

    // necessary variables for the game
    let deck: Card[] = $state<Card[]>([]);
    let playerHand: Card[] = $state<Card[]>([]);
    let dealerHand: Card[] = $state<Card[]>([]);
    let playerSum: number = $state(0); 
    let dealerSum: number = $state(0); 
    let gameOver: boolean = $state(false); 
    let message: string = $state(''); 
    
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
            // console.log('Current Hand:', playerHand.map(c => c.value + c.suit));
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
            adjustBalance(+bet_amount *2),
            message = 'Black Jack! You win!';
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
    // function resetBalance() {
    //     updateBalance(data.username, 5000);
    // }

    onMount(startGame); // Start the game when the component mounts
</script>

<svelte:head>
    {#each allCardImagePaths as imagePath}
        <link rel="preload" href={imagePath} as="image">
    {/each}
</svelte:head>


<h1 class="title">BLACK JACK</h1>

<div class="stat-container">
    <h3>Spiel</h3>
    <p>Kontostand: {localBalance} €</p>
    <p>Spieler Summe: {playerSum}</p>
    <p>Dealer: {dealerSum}</p>
    <p>Karten im Deck: {deck.length}</p>
    <p>Ergebnis: {message}</p>

    {#if gameOver} 
        <button onclick={startGame}>Neue Runde</button>
    {/if}

    {#if reshuffleAfterRound}
        <p>Deck wird nach der Runde neu gemischt...</p>
    {/if}

</div>

<div class="game-container">
      <div style="text-align: center;">
        <strong>Dealer:</strong>
        <div class="hand-dealer">
            {#if betPlaced}
                {#if gameOver}
                    <Hand hand={dealerHand} />
                {:else}
                    {#if dealerHand[0]}
                        <Hand hand={[dealerHand[0], {...dealerHand[1], show: false}]} />
                    {/if}
                {/if}
            {:else}
                        <Hand hand={[{...dealerHand[0], show: false}, {...dealerHand[1], show: false}]} />
            {/if}
        </div>
    </div>

    <div class="hand-player">
        <strong>Spieler:</strong>
        <Hand hand={playerHand} />
    </div>
</div>

<div class="controls">
    <div class="game-controls">
        <button onclick={hit} disabled={gameOver || !betPlaced}>Hit</button>
        <button onclick={stand} disabled={gameOver || !betPlaced}>Stand</button>
    </div>
    <div class="bet-controls">
        <button onclick={bet} disabled={gameOver || betPlaced}>Setzen</button>
        <button onclick={decreaseBet} disabled={bet_amount === bet_amounts[0] || betPlaced} style="margin-left: 1rem;">-</button>
        <div id="bet">${bet_amount}</div>
        <button onclick={increaseBet} disabled={bet_amount === bet_amounts[bet_amounts.length - 1] || betPlaced} style="margin-right: 1rem;">+</button>
    </div>
</div>

<style>
    .title{
        position: sticky;
        top: 0px;
    }

    .game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: sans-serif;
        margin-top: 2rem;
    }

    .controls {
        display: flex;
        flex-direction: row;
        position: absolute;
        bottom: 5%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
        padding: 0.5rem;
    }

    .bet-controls{
        display: flex;
        align-items: center;
        margin: 0.5rem;
        padding: 0.5rem;
        border-radius: 10px;
        background-color: var(--secondary-color);
    }

    .game-controls{
        margin: 0.5rem;
        padding: 0.5rem;
        border-radius: 10px;
        background-color: var(--secondary-color);
    }

    .hand-dealer{
        text-align: center;
        height: 18vh;
    }

    .hand-player {
        text-align: center;
        margin: 2rem;
        height: 25vh;
    }

    #bet {
        display: inline-block;
        width: 6ch; /* Platz für 4 Ziffern, z.B. "5000" */
        text-align: center;
        font-variant-numeric: tabular-nums; /* gleiche Ziffernbreite, falls unterstützt */
    }
</style>