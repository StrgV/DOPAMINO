<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import { balanceStore, updateBalance } from '$lib/stores/balanceStore';
    import { get } from 'svelte/store'
    import Hand from '$lib/components/Hand.svelte';
    import { 
        Round, 
        type Guess,
        initDeck,
        drawCard,
        checkColorGuess,
        checkHighLowGuess,
        checkInsideOutsideGuess,
        checkSuitGuess
    } from './busdriver';

    import { type Card } from '$lib/types/card'
    
    let { data } = $props();
    // let { data }: { data: PageData } = $props();


    // variables
    let localBalance = $state(0);

    let deck = $state<Card[]>([]);
    let drawnCards = $state<Card[]>([]);
    let currentRound = $state<Round>(Round.COLOR);
    let message = $state('');
    let gameOver = $state(false);
    let betPlaced = $state(false);

    let betAmount = $state(5); // Default bet amount
    let bet_amounts = $state([5, 10, 20, 50, 100, 200, 500, 1000, 2500, 5000]); // Possible bet amounts like in blackjack

    let showDeck = $state(true);
    // option to cash out 
    let canCashOut = $state(false);
    
    
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
        startGame();
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

    function placeBet() {
        if (localBalance < betAmount) {
            message = "Insufficient balance!"
            return;
        }
        adjustBalance(-betAmount);
        betPlaced = true;
    }

    // update balance in the database and store
    async function adjustBalance(amount: number) {
            // Update the global store which will update both UI and server
            await updateBalance(data.username, localBalance + amount);
        }
    
    function increaseBet() {
        const currentIndex = bet_amounts.indexOf(betAmount);
        if (currentIndex < bet_amounts.length - 1) {
            betAmount = bet_amounts[currentIndex + 1];
        }
    }

    function decreaseBet() {
        const currentIndex = bet_amounts.indexOf(betAmount);
        if (currentIndex > 0) {
            betAmount = bet_amounts[currentIndex - 1];
        }
    }

    function startGame() {
        deck = initDeck();
        drawnCards = [];
        currentRound = Round.COLOR;
        updateRoundMessage();
        gameOver = false;
        betPlaced = false;
        showDeck = true;
        canCashOut = false;
    }


    // Handle player guess
    function makeGuess(guess: Guess) {
        if (!betPlaced || gameOver) return;
            
        const newCard = drawCard(deck);
        if (!newCard) {
            message = 'No more cards in the deck!';
            return;
        }
            
        // Show the card
        newCard.show = true;
        drawnCards = [...drawnCards, newCard];
            
        // Check guess based on current round
        let correct = false;
            
        switch (currentRound) {
            case Round.COLOR:
                correct = checkColorGuess(newCard, guess as 'red' | 'black');
                break;
                    
            case Round.HIGH_LOW:
                correct = checkHighLowGuess(newCard, drawnCards[0], guess as 'higher' | 'lower');
                break;
                    
            case Round.INSIDE_OUTSIDE:
                correct = checkInsideOutsideGuess(
                    newCard, 
                    drawnCards[0], 
                    drawnCards[1], 
                    guess as 'inside' | 'outside'
                );
                break;
                    
            case Round.SUIT:
                correct = checkSuitGuess(newCard, guess as '♥️' | '♦️' | '♣️' | '♠️');
                break;
        }
            
        if (correct) {
            currentRound++;
            updateRoundMessage();
                
            // cahsout option
            canCashOut = currentRound < Round.END;

            if (currentRound === Round.END) {
                    gameOver = true;
                    message = 'Congratulations! You completed all rounds. You win!';
                    adjustBalance(betAmount * 2); // Double the bet as winnings
            }
        } else {
            gameOver = true;
            canCashOut = false;
            message = 'Incorrect guess! You lose.';
        }
    }

    // Update message based in round
    function updateRoundMessage() {
        switch (currentRound) {
            case Round.COLOR:
                message = 'Round 1: Guess if the next card is red or black.';
                break;
            case Round.HIGH_LOW:
                message = 'Round 2: Guess if the next card is higher or lower than the previous one.';
                break;   
            case Round.INSIDE_OUTSIDE:
                message = 'Round 3: Guess if the next card is inside or outside the range of the previous two cards.';
                break;
            case Round.SUIT:
                message = 'Round 4: Guess the suit of the next card.';
                break;
            case Round.END:
                message = 'Game completed!'
                break;
            default:
                message = 'Welcome to busdriver!'
                break;
        }
    }

    // cashout functio
    function cashOut() {
        if (canCashOut && !gameOver) {
            // win multiplier based on rounds completed
            let winMultiplier = 1;
            switch (currentRound) {
                case Round.HIGH_LOW:
                    winMultiplier = 2;
                    break;
                case Round.INSIDE_OUTSIDE:
                    winMultiplier = 3;
                    break;
                case Round.SUIT:
                    winMultiplier = 4;
                    break;
                case Round.END:
                    winMultiplier = 20;
                    break;
            }
            adjustBalance(betAmount * winMultiplier);
            canCashOut = false;
            gameOver = true;
            message = `You cashed out with a multiplier of x${winMultiplier}!`;
        }
    }

</script>

<svelte:head>
    {#each allCardImagePaths as imagePath}
        <link rel="preload" href={imagePath} as="image">
    {/each}
</svelte:head>

<h1>Busdriver</h1>
<p>Balance: {localBalance} €</p>

<div class="game-container">
    <p class="message">{message}</p>
    
    <div class="cards-container">
        {#if showDeck}
            <div class="deck-container">
                <Hand hand={[{suit: '♠️', value: 'A', show: false}]} />
            </div>
        {/if}
        <div class="drawn-cards">
            {#if drawnCards.length > 0}
                <Hand hand={drawnCards} />
            {/if}
        </div>
    </div>
    
    <div class="controls">
        {#if !betPlaced && !gameOver}
            <div class="bet-controls">
                <button onclick={placeBet} disabled={localBalance < betAmount}>Place Bet</button>
                <button onclick={decreaseBet} disabled={betAmount === bet_amounts[0]} style="margin-left: 1rem;">-</button>
                <div id="bet">{betAmount} €</div>
                <button onclick={increaseBet} disabled={betAmount === bet_amounts[bet_amounts.length - 1]} style="margin-right: 1rem;">+</button>
            </div>
        {:else if !gameOver}
            <div class="guess-controls">
                {#if currentRound === Round.COLOR}
                    <button onclick={() => makeGuess('red')}>Red</button>
                    <button onclick={() => makeGuess('black')}>Black</button>
                {:else if currentRound === Round.HIGH_LOW}
                    <button onclick={() => makeGuess('higher')}>Higher</button>
                    <button onclick={() => makeGuess('lower')}>Lower</button>
                {:else if currentRound === Round.INSIDE_OUTSIDE}
                    <button onclick={() => makeGuess('inside')}>Inside</button>
                    <button onclick={() => makeGuess('outside')}>Outside</button>
                {:else if currentRound === Round.SUIT}
                    <button onclick={() => makeGuess('♥️')}>♥️</button>
                    <button onclick={() => makeGuess('♦️')}>♦️</button>
                    <button onclick={() => makeGuess('♣️')}>♣️</button>
                    <button onclick={() => makeGuess('♠️')}>♠️</button>
                {/if}

                {#if canCashOut}
                    <button onclick={cashOut} class="cash-out">Cash Out</button>
                {/if}
            </div>
        {/if}
        
        {#if gameOver}
            <button onclick={startGame}>Play Again</button>
        {/if}
    </div>
</div>

<style>
 h1 {
        text-align: center;
        margin-top: 0.5rem;
    }
    
    p {
        text-align: center;
        margin-bottom: 0.1rem;
    }
    
    .message {
        font-size: 1.2rem;
        margin: 0.5rem 0;
        text-align: center;
        font-weight: bold;
    }
    
    .game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* max-width: 1000px; */
        margin: 0 auto;
    }
    
    .drawn-cards {
        text-align: center;
        margin-bottom: 1.7rem;
        margin-top: 1rem;
        height: 12rem;
    }

    .deck-container {
        text-align: center;
        margin: 0.5rem;
        margin-top: 0;
        height: 12rem;
    }
    
    .cards-container {
        margin-top: 0;

    }

    .controls {
        position: absolute;
        bottom: 5%;
    }
    .bet-controls, .guess-controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        background-color: var(--secondary-color, #7a5de5);
        padding: 1rem;
        border-radius: 10px;
    }
    
    #bet {
        display: inline-block;
        width: 6ch;
        text-align: center;
        font-variant-numeric: tabular-nums;
        font-weight: bold;
        color: white;
    }
    
    button {
        padding: 0.5rem 1rem;
        background-color: var(--accent-color, #ffbe1a);
        color: var(--text-color-dark, #160433);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }
    
    button:hover {
        filter: brightness(1.1);
    }
    
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .cash-out {
        background-color: #22c55e;
        color: white;
        margin-left: 1rem;
    }
    

</style>

<!-- 
<style>
     .cards-container {
        display: flex;
     }
    #bet {
        display: inline-block;
        width: 6ch;
        text-align: center;
        font-variant-numeric: tabular-nums;
    }
    
    .bet-controls {
        display: flex;
        align-items: center;
        margin: 0.5rem;
        padding: 0.5rem;
        border-radius: 10px;
        background-color: var(--secondary-color);
    }
    
    .game-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 2rem;
    }
    
    .message {
        font-size: 1.2rem;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    
    .cards-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    .drawn-cards {
        min-height: 150px;
        display: flex;
        justify-content: center;
    }
    
    .deck-container {
        text-align: center;
    }
    
    .card-back {
        width: 60px;
        height: 90px;
        background-color: var(--accent-color, #ffbe1a);
        border: 1px solid var(--secondary-color, #7a5de5);
        border-radius: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5rem;
        margin: 0.5rem auto;
    }
    
    .controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .bet-controls, .guess-controls {
        display: flex;
        gap: 0.5rem;
        background-color: var(--secondary-color, #7a5de5);
        padding: 0.5rem;
        border-radius: 5px;
    }
    
    button {
        padding: 0.5rem 1rem;
        background-color: var(--accent-color, #ffbe1a);
        color: var(--text-color-dark, #160433);
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style> -->