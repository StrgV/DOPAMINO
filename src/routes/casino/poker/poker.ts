import { type Card, createDeck, shuffleDeck } from '../black-jack/blackjack';

export type PokerHand = {
    playerHand: Card[];
    sharedCards: Card[];
    playerBestHand: Card[];
    dealerBestHand: Card[];
}

let deck: Card[] = [];
let sharedCards: Card[] = [];
let playerHand: Card[] = [];
let dealerHand: Card[] = [];
let pot = 0;

// Function to draw a card from the deck, similar to the one used in blackjack, but in poker the deck is shuffeled after each game
export function drawCard(): Card {
    const card = deck.pop()!;
    console.log(`Drew card: ${card.value}${card.suit}`);
    return card;
}

// start a new game
export function startPokerGame() {
    console.log("Starting new poker game");
    deck = createDeck(1); // 1 deck - 52 cards
    sharedCards = [];
    playerHand = [];
    dealerHand = [];
    pot = 0;
    shuffleDeck(deck);
    console.log(`Deck created with ${deck.length} cards`);
    
    // Return empty arrays to reset the component state
    return { sharedCards: [], playerHand: [], dealerHand: [] };
}

export function dealCards(count: number): Card[] {
    console.log(`Dealing ${count} cards`);
    const dealtCards: Card[] = [];
    for (let i = 0; i < count; i++) {
        dealtCards.push(drawCard());
    }
    return dealtCards;
}


// evaluate the player's and dealer's hands
export function evaluateHand(hand: Card[], sharedCards: Card[]): { rank: number; bestHand: Card[] } {
    console.log("Evaluating hand:", hand, "with shared cards:", sharedCards);
    
    const allCards = [...hand, ...sharedCards].filter(card => card !== null && card !== undefined);
    console.log("All cards for evaluation:", allCards);
    
    // Guard against empty hand
    if (allCards.length === 0) {
        console.error("No valid cards to evaluate");
        return { rank: 0, bestHand: [] };
    }
    
    // Create frequency maps
    const suits: Record<string, number> = {};
    const values: Record<string, number> = {};
    
    for (const card of allCards) {
        if (!card || !card.suit || !card.value) {
            console.warn("Invalid card found:", card);
            continue;
        }
        suits[card.suit] = (suits[card.suit] || 0) + 1;
        values[card.value] = (values[card.value] || 0) + 1;
    }
    
    console.log("Suits frequency:", suits);
    console.log("Values frequency:", values);
    
    const sortedValues = Object.keys(values)
        .map(value => ({ value, count: values[value] }))
        .sort((a, b) => b.count - a.count || parseInt(b.value, 10) - parseInt(a.value, 10));
    
    console.log("Sorted values:", sortedValues);
    
    // Check for special hands
    const isFlush = Object.values(suits).some(count => count >= 5);
    const isStraight = checkStraight(Object.keys(values));
    const isRoyal = isStraight && isFlush && checkRoyal(Object.keys(values));

    let rank: number;
    let bestHand: Card[];

    if (isRoyal) {
        rank = 10;
        bestHand = getBestFlush(allCards);
    } else if (isStraight && isFlush) {
        rank = 9;
        bestHand = getBestFlush(allCards);
    } else if (sortedValues[0].count === 4) {
        rank = 8;
        bestHand = getBestOfKind(allCards, 4);
    } else if (sortedValues[0].count === 3 && sortedValues.length > 1 && sortedValues[1]?.count === 2) {
        rank = 7;
        bestHand = getFullHouse(allCards);
    } else if (isFlush) {
        rank = 6;
        bestHand = getBestFlush(allCards);
    } else if (isStraight) {
        rank = 5;
        bestHand = getBestStraight(allCards);
    } else if (sortedValues[0].count === 3) {
        rank = 4;
        bestHand = getBestOfKind(allCards, 3);
    } else if (sortedValues[0].count === 2 && sortedValues.length > 1 && sortedValues[1]?.count === 2) {
        rank = 3;
        bestHand = getTwoPairs(allCards);
    } else if (sortedValues[0].count === 2) {
        rank = 2;
        bestHand = getBestOfKind(allCards, 2);
    } else {
        rank = 1;
        bestHand = getHighCard(allCards);
    }

    console.log(`Hand rank: ${rank}, Best hand:`, bestHand);
    return { rank, bestHand: bestHand || allCards.slice(0, 5) }; // Fallback to default if bestHand is null
}

function checkStraight(values: string[]): boolean {
    const sorted = values.map(v => parseInt(v, 10)).sort((a, b) => a - b);
    for (let i = 0; i <= sorted.length - 5; i++) {
        if (sorted[i + 4] - sorted[i] === 4) return true;
    }
    return false;
}

function checkRoyal(values: string[]): boolean {
    const royal = ['10', 'J', 'Q', 'K', 'A'];
    return royal.every(value => values.includes(value));
}

function getBestFlush(cards: Card[]): Card[] {
    const flushSuit = Object.entries(cards.reduce((acc, card) => {
        acc[card.suit] = (acc[card.suit] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).find(([_, count]) => count >= 5)?.[0];
    return cards.filter(card => card.suit === flushSuit).slice(0, 5);
}

// function getBestOfKind(cards: Card[], count: number): Card[] {
//     const value = Object.entries(cards.reduce((acc, card) => {
//         acc[card.value] = (acc[card.value] || 0) + 1;
//         return acc;
//     }, {} as Record<string, number>)).find(([_, c]) => c === count)?.[0];
//     return cards.filter(card => card.value === value).slice(0, count);
// }

function getBestOfKind(cards: Card[], count: number): Card[] {
    // Hilfsfunktion zum Vergleichen von Kartenwerten
    const getCardValue = (card: Card): number => {
        if (card.value === 'A') return 14;
        if (card.value === 'K') return 13;
        if (card.value === 'Q') return 12;
        if (card.value === 'B') return 11;
        return parseInt(card.value, 10) || 0;
    };
    
    // Finde den häufigsten Kartenwert
    const value = Object.entries(cards.reduce((acc, card) => {
        acc[card.value] = (acc[card.value] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).find(([_, c]) => c === count)?.[0];
    
    // Sammle die Karten mit diesem Wert
    const matchingCards = cards.filter(card => card.value === value);
    
    // Sammle die restlichen Karten und sortiere sie nach Wert (höchste zuerst)
    const remainingCards = cards
        .filter(card => card.value !== value)
        .sort((a, b) => getCardValue(b) - getCardValue(a));
    
    // Kombiniere die passenden Karten mit den höchsten übrigen Karten
    return [
        ...matchingCards.slice(0, count),
        ...remainingCards.slice(0, 5 - count)
    ];
}

function getFullHouse(cards: Card[]): Card[] {
    const values = Object.entries(cards.reduce((acc, card) => {
        acc[card.value] = (acc[card.value] || 0) + 1;
        return acc;
    }, {} as Record<string, number>));
    const three = values.find(([_, count]) => count === 3)?.[0];
    const two = values.find(([_, count]) => count === 2)?.[0];
    return [...cards.filter(card => card.value === three).slice(0, 3), ...cards.filter(card => card.value === two).slice(0, 2)];
}

function getBestStraight(cards: Card[]): Card[] {
    const sorted = cards.map(card => parseInt(card.value, 10)).sort((a, b) => a - b);
    for (let i = 0; i <= sorted.length - 5; i++) {
        if (sorted[i + 4] - sorted[i] === 4) {
            return cards.filter(card => sorted.slice(i, i + 5).includes(parseInt(card.value, 10)));
        }
    }
    return [];
}

function getTwoPairs(cards: Card[]): Card[] {
    const pairs = Object.entries(cards.reduce((acc, card) => {
        acc[card.value] = (acc[card.value] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).filter(([_, count]) => count === 2).slice(0, 2);
    return pairs.flatMap(([value]) => cards.filter(card => card.value === value).slice(0, 2));
}

function getHighCard(cards: Card[]): Card[] {
    return cards.sort((a, b) => parseInt(b.value, 10) - parseInt(a.value, 10)).slice(0, 5);
}

export function showdown(
    playerHand: Card[], 
    dealerHand: Card[], 
    sharedCards: Card[]
): { winner: 'Player' | 'Dealer'; pot: number; playerBestHand: Card[]; dealerBestHand: Card[]; originalDealerHand: Card[] } {
    console.log("SHOWDOWN EVALUATION STARTING");
    console.log("Player hand:", playerHand);
    console.log("Dealer hand:", dealerHand);
    console.log("Shared cards:", sharedCards);

    const playerHandCopy = [...playerHand];
    const dealerHandCopy = [...dealerHand];
    const sharedCardsCopy = [...sharedCards];

    if (!playerHandCopy.length) {
        console.error("Player hand is invalid:", playerHandCopy);
        return { 
            winner: 'Dealer', 
            pot, 
            playerBestHand: [], 
            dealerBestHand: dealerHandCopy,
            originalDealerHand: dealerHandCopy
        };
    }

    if (!dealerHandCopy.length) {
        console.error("Dealer hand is invalid:", dealerHandCopy);
        return { 
            winner: 'Player', 
            pot, 
            playerBestHand: playerHandCopy, 
            dealerBestHand: [],
            originalDealerHand: dealerHandCopy
        };
    }

    const playerResult = evaluateHand(playerHandCopy, sharedCardsCopy);
    const dealerResult = evaluateHand(dealerHandCopy, sharedCardsCopy);

    console.log("Player hand evaluation:", playerResult);
    console.log("Dealer hand evaluation:", dealerResult);

    let winner: 'Player' | 'Dealer';

    if (playerResult.rank > dealerResult.rank) {
        winner = 'Player';
        console.log("Player wins with higher rank:", playerResult.rank, "vs", dealerResult.rank);
    } else if (playerResult.rank < dealerResult.rank) {
        winner = 'Dealer';
        console.log("Dealer wins with higher rank:", dealerResult.rank, "vs", playerResult.rank);
    } else {
        const getCardValue = (card: Card): number => {
            if (!card) return 0;
            if (card.value === 'A') return 14;
            if (card.value === 'K') return 13;
            if (card.value === 'Q') return 12;
            if (card.value === 'B') return 11;
            return parseInt(card.value, 10) || 0;
        };

        const playerSortedHand = [...playerResult.bestHand].sort((a, b) => getCardValue(b) - getCardValue(a));
        const dealerSortedHand = [...dealerResult.bestHand].sort((a, b) => getCardValue(b) - getCardValue(a));

        let cardWinner: 'Player' | 'Dealer' | null = null;
        for (let i = 0; i < Math.min(playerSortedHand.length, dealerSortedHand.length); i++) {
            const playerCardValue = getCardValue(playerSortedHand[i]);
            const dealerCardValue = getCardValue(dealerSortedHand[i]);

            if (playerCardValue > dealerCardValue) {
                cardWinner = 'Player';
                break;
            } else if (dealerCardValue > playerCardValue) {
                cardWinner = 'Dealer';
                break;
            }
        }

        winner = cardWinner || 'Player';
        console.log(`${winner} wins with high card comparison`);
    }

    console.log("Determining winner:", winner);

    return {
        winner,
        pot,
        playerBestHand: playerResult.bestHand || playerHandCopy,
        dealerBestHand: dealerResult.bestHand || dealerHandCopy,
        originalDealerHand: dealerHandCopy
    };
}

