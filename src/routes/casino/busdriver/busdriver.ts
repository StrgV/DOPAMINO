import { createDeck, shuffleDeck } from '../black-jack/blackjack';
import { type Card } from '$lib/types/card'

export enum Round {
    COLOR = 1,
    HIGH_LOW = 2,
    INSIDE_OUTSIDE = 3,
    SUIT = 4,
    END = 5
}

export type Guess = 'black' | 'red' | 'higher' | 'lower' | 'inside' | 'outside' | '♥️' | '♦️' | '♠️' | '♣️';

// creates and shuffles a dekc od cards
export function initDeck():Card[] {
    return shuffleDeck(createDeck(1));
}

// draw a Card from the given deck
export function drawCard(deck: Card[]): Card | undefined {
    return deck.pop();
}

// cheakc color guess
export function checkColorGuess(card: Card, guess: 'red' | 'black'): boolean {
    return ((card.suit === '♥️' || card.suit === '♦️') && guess === 'red' || (card.suit === '♠️' || card.suit === '♣️') && guess === 'black');
} 

// get numeric value from picture cards
export function getCardValue(card: Card): number {
    if (card.value === 'A') return 14;
    if (card.value === 'K') return 13;
    if (card.value === 'Q') return 12;
    if (card.value === 'B') return 11;
    return parseInt(card.value, 10);
}

export function checkHighLowGuess(newCard: Card, previousCard: Card, guess: 'higher' | 'lower'): boolean {
    // get value from new and previous Cards
    const newValue = getCardValue(newCard);
    const prevValue = getCardValue(previousCard);
    
    // if (newValue === prevValue) return true; // Equal cards count as correct
    return (newValue >= prevValue && guess === 'higher') || (newValue <= prevValue && guess === 'lower');
}

// check inside / outside
export function checkInsideOutsideGuess(
    newCard: Card,
    card1: Card,
    card2: Card,
    guess: 'inside' | 'outside'
): boolean {

    const newValue = getCardValue(newCard);
    const value1 = getCardValue(card1);
    const value2 = getCardValue(card2);

    const min = Math.min(value1, value2);
    const max = Math.max(value1, value2);

    const isInside = newValue >= min && newValue <= max;
    return (isInside && guess === 'inside' || !isInside && guess === 'outside');
    }

export function checkSuitGuess(card: Card, guess: '♥️' | '♦️' | '♣️' | '♠️'): boolean {
    return card.suit === guess;
}
