<script lang="ts">
    import { type Card, createDeck} from '../black-jack/blackjack';
    import Hand from '$lib/components/Hand.svelte';
       
    let hand: Card[] = createDeck(1);
    let sampleHand: Card[] = [hand[1], hand[32], hand[22], hand[4], hand[3], hand[2], hand[21]];
    
</script>


<Hand hand={sampleHand} />