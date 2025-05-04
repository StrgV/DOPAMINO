<script lang="ts">
    import { startPokerGame, dealCards, showdown, evaluateHand } from './poker';
    import { type Card } from '../black-jack/blackjack';
    import { balanceStore } from '$lib/stores/balanceStore';
    import { onMount } from 'svelte';

    export let data: { username: string };

    let balance = 0;
    let pot = 0;
    let playerHand: Card[] = [];
    let dealerHand: Card[] = [];
    let sharedCards: Card[] = [];
    let message = '';
    let chips = [10, 50, 100, 500, 1000, 5000];
    let gameStarted = false;
    let bettingActive = false;
    let currentBet = 0;
    let playerBet = 0;
    let roundBet = 0;

    const smallBlind = 50;
    const bigBlind = smallBlind * 2;

    $: balanceStore.subscribe(value => balance = value);

    async function adjustBalance(amount: number) {
        balance += amount;
        balanceStore.set(balance);
        await fetch('/api/update-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: data.username,
                balance: balance
            })
        });
    }

    function startGame() {
        startPokerGame();
        
        sharedCards = [];
        playerHand = [];
        dealerHand = [];
        
        message = 'Game started!';
        pot = smallBlind + bigBlind;
        adjustBalance(-smallBlind);
        message += ` Small blind: ${smallBlind} €, Big blind: ${bigBlind} €.`;
        gameStarted = true;
        bettingActive = true;
        dealInitialCards();
    }

    function dealInitialCards() {
        playerHand = dealCards(2);
        dealerHand = dealCards(2);
    }

    function placeBet(chip: number) {
        if (!bettingActive) {
            message = 'Betting is not active!';
            return;
        }
        if (balance >= chip) {
            adjustBalance(-chip);
            playerBet += chip;
            roundBet += chip;
            pot += chip; // Add player's bet to the pot
            pot += chip; // Dealer matches the bet - add to pot
            message = `You raised your bet by ${roundBet} € this round. Dealer calls.`;
        } else {
            message = 'Insufficient balance!';
        }
    }

    function check() {
        if (!bettingActive) return;
        if (currentBet === 0) {
            message = 'You checked. Dealer checks too.';
            proceedToNextPhase();
        } else {
            message = 'You cannot check when there is a bet to call!';
        }
    }

    function call() {
        if (!bettingActive) return;
        const callAmount = currentBet - playerBet;
        if (balance >= callAmount) {
            adjustBalance(-callAmount);
            pot += callAmount;
            playerBet = currentBet;
            message = `You called ${callAmount} €. Dealer calls.`;
            proceedToNextPhase();
        } else {
            message = 'Insufficient balance to call!';
        }
    }

    function raise() {
        if (!bettingActive) return;
        if (playerBet > currentBet) {
            const raiseAmount = playerBet - currentBet;
            pot += playerBet; // Add player's total bet to pot
            pot += raiseAmount; // Dealer matches only the raise portion
            currentBet = playerBet;
            roundBet = 0;
            message = `You raised to ${playerBet} €. Dealer calls your raise.`; 
            proceedToNextPhase();
        } else {
            message = 'Your raise must exceed the current bet!';
        }
    }

    function foldGame() {
        message = 'You folded. Dealer wins!';
        gameStarted = false;
        bettingActive = false;
    }

    function revealCards(count: number) {
        const newCards = dealCards(count);
        sharedCards = [...sharedCards, ...newCards];
    }

    function revealShowdown() {
        bettingActive = false;

        const result = showdown(playerHand, dealerHand, sharedCards);
        message = `Winner: ${result.winner}! ${result.winner} wins ${pot} €`;
        dealerHand = [...dealerHand]; // Force reactivity
        gameStarted = false;

        if (result.winner === 'Player') {
            adjustBalance(pot);
        }
    }

    function proceedToNextPhase() {
        if (sharedCards.length === 0) {
            revealCards(3); // Flop
            message = "Flop revealed";
        } else if (sharedCards.length === 3) {
            revealCards(1); // Turn
            message = "Turn revealed";
        } else if (sharedCards.length === 4) {
            revealCards(1); // River
            message = "River revealed";
        } else if (sharedCards.length === 5) {
            revealShowdown();
            return;
        }

        currentBet = 0;
        playerBet = 0;
        bettingActive = true;
    }

    onMount(async () => {
        const res = await fetch('/api/get-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: data.username })
        });
        const result = await res.json();
        if (result.success) {
            balanceStore.set(result.balance);
        }
    });
</script>

<h1>Poker</h1>
<p>Welcome to the Poker page!</p>
<p>Logged in as: {data.username}</p>
<p>Balance: {balance} €</p>

<div class="game-container">
    <div class="dealer-hand">
        <strong>Dealer:</strong><br />
        <div class="card-row">
            {#if gameStarted}
                {#if !bettingActive}
                    {#each dealerHand as card}
                        <span class="card">{card.value}{card.suit}</span>
                    {/each}
                {:else}
                    {#each dealerHand as _}
                        <span class="card">🂠</span>
                    {/each}
                {/if}
            {:else}
                {#if dealerHand.length > 0}
                    {#each dealerHand as card}
                        <span class="card">{card.value}{card.suit}</span>
                    {/each}
                {:else}
                    <span class="card">🂠</span>
                    <span class="card">🂠</span>
                {/if}
            {/if}
        </div>
    </div>

    <div class="player-hand">
        <strong>Player:</strong><br />
        <div class="card-row">
            {#each playerHand as card}
                <span class="card">{card.value}{card.suit}</span>
            {/each}
        </div>
    </div>

    <div class="shared-cards">
        <strong>Shared Cards:</strong><br />
        <div class="card-row">
            {#each sharedCards as card}
                <span class="card">{card.value}{card.suit}</span>
            {/each}
        </div>
    </div>

    <p>Pot: {pot} €</p>
    <p>{message}</p>

    <div class="buttons">
        {#if gameStarted}
            <div>
                <h2>Place your bet:</h2>
                {#each chips as chip}
                    <button on:click={() => placeBet(chip)} disabled={!bettingActive}>{chip} €</button>
                {/each}
                <button on:click={check} disabled={!bettingActive}>Check</button>
                <button on:click={call} disabled={!bettingActive}>Call</button>
                <button on:click={raise} disabled={!bettingActive}>Raise</button>
                <button on:click={foldGame} disabled={!bettingActive}>Fold</button>
            </div>
        {:else}
            <button on:click={startGame}>Start Game</button>
        {/if}
    </div>
</div>

<div class="tooltip">
    <span class="info-icon">ℹ️ Poker Hand Rankings</span>
    <div class="tooltiptext">
        <div class="hand-rankings">
            <div class="rank">
                <span class="rank-num">1</span> 
                <div>
                    <strong>Royal Flush</strong>
                    <div class="example-cards">
                        <span class="mini-card">10♠️</span>
                        <span class="mini-card">J♠️</span>
                        <span class="mini-card">Q♠️</span>
                        <span class="mini-card">K♠️</span>
                        <span class="mini-card">A♠️</span>
                    </div>
                </div>
            </div>
            <div class="rank">
                <span class="rank-num">2</span> 
                <div>
                    <strong>Straight Flush</strong>
                    <div class="example-cards">
                        <span class="mini-card">5♥️</span>
                        <span class="mini-card">6♥️</span>
                        <span class="mini-card">7♥️</span>
                        <span class="mini-card">8♥️</span>
                        <span class="mini-card">9♥️</span>
                    </div>
                </div>
            </div>
            <div class="rank">
                <span class="rank-num">3</span> 
                <div>
                    <strong>Four of a Kind</strong>
                    <div class="example-cards">
                        <span class="mini-card">Q♠️</span>
                        <span class="mini-card">Q♥️</span>
                        <span class="mini-card">Q♦️</span>
                        <span class="mini-card">Q♣️</span>
                        <span class="mini-card">7♠️</span>
                    </div>
                </div>
            </div>
            <div class="rank">
                <span class="rank-num">4</span> 
                <div>
                    <strong>Full House</strong>
                    <div class="example-cards">
                        <span class="mini-card">J♥️</span>
                        <span class="mini-card">J♦️</span>
                        <span class="mini-card">J♣️</span>
                        <span class="mini-card">8♠️</span>
                        <span class="mini-card">8♥️</span>
                    </div>
                </div>
            </div>
            <div class="rank">
                <span class="rank-num">5</span> 
                <div>
                    <strong>Flush</strong>
                    <div class="example-cards">
                        <span class="mini-card">A♣️</span>
                        <span class="mini-card">J♣️</span>
                        <span class="mini-card">8♣️</span>
                        <span class="mini-card">6♣️</span>
                        <span class="mini-card">2♣️</span>
                    </div>
                </div>
            </div>
            <div class="rank">
                <span class="rank-num">6</span> 
                <div>
                    <strong>Straight</strong>
                    <div class="example-cards">
                        <span class="mini-card">6♥️</span>
                        <span class="mini-card">7♦️</span>
                        <span class="mini-card">8♠️</span>
                        <span class="mini-card">9♣️</span>
                        <span class="mini-card">10♥️</span>
                    </div>
                </div>
            </div>
            <div class="rank">
                <span class="rank-num">7</span> 
                <div>
                    <strong>Three of a Kind</strong>
                    <div class="example-cards">
                        <span class="mini-card">10♠️</span>
                        <span class="mini-card">10♥️</span>
                        <span class="mini-card">10♦️</span>
                        <span class="mini-card">K♠️</span>
                        <span class="mini-card">4♣️</span>
                    </div>
                </div>
            </div>
            <div class="rank">
                <span class="rank-num">8</span> 
                <div>
                    <strong>Two Pair</strong>
                    <div class="example-cards">
                        <span class="mini-card">9♠️</span>
                        <span class="mini-card">9♥️</span>
                        <span class="mini-card">5♦️</span>
                        <span class="mini-card">5♣️</span>
                        <span class="mini-card">A♠️</span>
                    </div>
                </div>
            </div>
            <div class="rank">
                <span class="rank-num">9</span> 
                <div>
                    <strong>Pair</strong>
                    <div class="example-cards">
                        <span class="mini-card">K♥️</span>
                        <span class="mini-card">K♦️</span>
                        <span class="mini-card">J♣️</span>
                        <span class="mini-card">7♠️</span>
                        <span class="mini-card">2♥️</span>
                    </div>
                </div>
            </div>
            <div class="rank">
                <span class="rank-num">10</span> 
                <div>
                    <strong>High Card</strong>
                    <div class="example-cards">
                        <span class="mini-card">A♥️</span>
                        <span class="mini-card">K♦️</span>
                        <span class="mini-card">J♠️</span>
                        <span class="mini-card">8♣️</span>
                        <span class="mini-card">3♥️</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="ranking-image">
            <img src="https://www.888poker.com/magazine/sites/magazine.888poker.com/files/inline-images/poker-hand-ranking-770X1622_0.jpg" alt="Poker Hand Rankings Chart" />
        </div>
    </div>
</div>

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
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
    }
    .card-row {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    .card {
        padding: 0.25rem 0.5rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        background: white;
        color: black;
        font-weight: bold;
    }
    .tooltip {
        position: relative;
        display: inline-block;
        margin-top: 20px;
        cursor: pointer;
    }
    
    .info-icon {
        padding: 5px 10px;
        background-color: var(--accent-color, #ffbe1a);
        color: var(--text-color-dark, #160433);
        border-radius: 5px;
        font-weight: bold;
        border: 1px solid var(--accent-color, #ffbe1a);
    }
    
    .tooltip .tooltiptext {
        visibility: hidden;
        width: 500px;
        background-color: var(--background-color, #18122b);
        color: var(--text-color-light, #dcdcf9);
        text-align: left;
        border-radius: 6px;
        padding: 15px;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        margin-left: -250px; /* Half of width */
        opacity: 0;
        transition: opacity 0.3s;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        border: 1px solid var(--secondary-color, #7a5de5);
        max-height: 500px;
        overflow-y: auto;
    }
    
    .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
    }
    
    .hand-rankings {
        display: grid;
        gap: 5px;
        margin-bottom: 15px;
    }
    
    .rank {
        display: flex;
        align-items: flex-start;
        padding: 3px 0;
    }
    
    .rank-num {
        background-color: var(--accent-color, #ffbe1a);
        color: var(--text-color-dark, #160433);
        width: 25px;
        height: 25px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        font-weight: bold;
        flex-shrink: 0;
    }
    
    .example-cards {
        display: flex;
        gap: 2px;
        margin-top: 3px;
    }
    
    .mini-card {
        background: white;
        color: black;
        border-radius: 3px;
        padding: 2px 3px;
        font-size: 0.8em;
        border: 1px solid #ccc;
    }
    
    .ranking-image {
        margin-top: 15px;
        border-top: 1px solid var(--secondary-color, #7a5de5);
        padding-top: 15px;
    }
    
    .ranking-image img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
    }
</style>