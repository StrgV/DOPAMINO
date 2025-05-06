<script lang="ts">
    import { type Card, createDeck} from '../black-jack/blackjack';
    import CardComponent from '$lib/components/Card.svelte';
       
    let hand: Card[] = createDeck(1);
    let sampleHand: Card[] = [hand[1], hand[32], hand[22]];

export function suitToChar(suit: string): string {
    switch (suit) {
        case '♥️':
            return 'H';
        case '♦️':
            return 'D';
        case '♣️':
            return 'C';
        case '♠️':
            return 'S';
        default:
            return '';
    }
}

</script>

<h1>Card_test</h1>



<div class="hand">
    
    {#each sampleHand as card}
        <CardComponent value={card.value} suit={card.suit} />
    {/each}
    
</div>



<style>
    .hand{
        display: flex;
        height: 50vh;
        width: 50vh;
        align-items: center;
        justify-content: center;
    }

</style>