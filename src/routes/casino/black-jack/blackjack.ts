export type Card = {
    suit: '♥️' | '♦️' | '♣️' | '♠️';
    value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
};

export function createDeck(deckCount = 2): Card[] {
    const suits: Card['suit'][] = ['♥️', '♦️', '♣️', '♠️'];
    const values: Card['value'][] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck: Card[] = [];

    // Erstelle 2 vollständige Decks
    for (let d = 0; d < deckCount; d++) {
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
            }
        }
    }

    return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function calculateSum(hand: Card[]): number {
    let sum = 0;
    let aces = 0;
    for (const card of hand) {
        if (card.value === 'A') {
            sum += 11;
            aces++;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            sum += 10;
        } else {
            sum += parseInt(card.value, 10);
        }
    }

    // Adjust for aces if sum exceeds 21
    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    return sum;
}

