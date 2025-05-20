<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import Diamonds from '$lib/assets/Diamonds.svg';
    import Clubs from '$lib/assets/clubs.svg';
    import Hearts from '$lib/assets/Hearts.svg';
    import Spades from '$lib/assets/Spades.svg'; 
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
                correct = checkColorGuess(newCard, guess as 'yellow' | 'purple');
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
                message = 'Round 1: Guess if the next card is yellow or purple.';
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

<h1>BUSDRIVER</h1>
<p class="message">{message}</p>
<div class="content">
    <!-- <div class="game-container"> -->
        <div class="cards-container">

            {#if drawnCards.length > 0}
                    <Hand hand={drawnCards} />
            {/if}
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
                        <button onclick={() => makeGuess('yellow')}>Yellow</button>
                        <button onclick={() => makeGuess('purple')}>Purple</button>
                    {:else if currentRound === Round.HIGH_LOW}
                        <button onclick={() => makeGuess('higher')}>Higher</button>
                        <button onclick={() => makeGuess('lower')}>Lower</button>
                    {:else if currentRound === Round.INSIDE_OUTSIDE}
                        <button onclick={() => makeGuess('inside')}>Inside</button>
                        <button onclick={() => makeGuess('outside')}>Outside</button>
                    {:else if currentRound === Round.SUIT}
                        <button onclick={() => makeGuess('♥️')} class="suit-buttons"><img src="{Hearts}" alt="Hearts" style="height: 20px"></button>
                        <button onclick={() => makeGuess('♦️')} class="suit-buttons"><img src="{Diamonds}" alt="Diamonds" style="height: 20px"></button>
                        <button onclick={() => makeGuess('♣️')} class="suit-buttons"><img src="{Clubs}" alt="Clubs" style="height: 20px"></button>
                        <button onclick={() => makeGuess('♠️')} class="suit-buttons"><img src="{Spades}" alt="Spades" style="height: 20px"></button>
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
    <!-- </div> -->
</div>

<div class="stat-container">
    <h3>Spiel</h3>
    <p>Kontostand: {localBalance} €</p>
    <p>Potentieller Gewinn: {betPlaced ? betAmount * (currentRound === Round.COLOR ? 1 : currentRound === Round.HIGH_LOW ? 2 : currentRound === Round.INSIDE_OUTSIDE ? 3 : currentRound === Round.SUIT ? 4 : 20) : 0} €</p>
    <p>Einsatz: {betAmount} €</p>
    <p>Karten im Deck: {deck.length}</p>
    <p>Runde: {currentRound}</p>
    <p>Multiplikator bei Gewinn: {betPlaced ? (currentRound === Round.COLOR ? 2 : currentRound === Round.HIGH_LOW ? 3 : currentRound === Round.INSIDE_OUTSIDE ? 4 : currentRound === Round.SUIT ? 20 : 20) : 1}</p>
    
    {#if gameOver && !betPlaced}
        <button onclick={startGame}>Neue Runde</button>
    {/if}
</div>

<style>
 h1 {
        position: sticky;
        top: 0px;
    }
    
    .message {
        font-size: 1.2rem;
        margin: 0.5rem 0;
        text-align: center;
        font-weight: bold;
    }
    
    .cards-container {
        height: 80%;
        width: 40vw;
        margin-bottom: 10%;
    }

    .controls {
        display: flex;
        flex-direction: row;
        position: sticky;
        bottom: 5%;
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

    .guess-controls{
        margin: 0.5rem;
        padding: 0.5rem;
        border-radius: 10px;
        background-color: var(--secondary-color);
    }
    
    #bet {
        display: inline-block;
        width: 6ch;
        text-align: center;
        font-variant-numeric: tabular-nums;
        font-weight: bold;
        color: white;
    }

    .suit-buttons {
        background: white;
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
