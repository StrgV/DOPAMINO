<script lang="ts">
    import { fly } from "svelte/transition";

   let { value, suit, style } = $props(); 

    // Translate the suits to characters for the image paths
    function suitToChar(suit: string): string {
        switch (suit) {
            case '♥️': return 'H';
            case '♦️': return 'D';
            case '♣️': return 'C';
            case '♠️': return 'S';
            default: return '';
        }
    }

    const imagePath = `/Cards/Card_${value}${suitToChar(suit)}.svg`;

</script>

<!-- Display the card with animations -->
<div class="card" style="{style}" in:fly={{ y: 30, duration: 200 }}>
    <img src={imagePath} alt={`Playing card: ${value}${suit}`} />
</div>

<style>
    .card{
        position: relative;
        display: flex;
        height: 100%;
        width: auto;
        filter: drop-shadow(0px 10px 10px black);
        transition: top 0.3s ease, transform 0.3s ease;
    }
    .card img {
        position: relative; 
        display: block;
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
    }

    .card:hover {
        cursor: pointer;
        transform: translate(0, -20%);
    }
</style>
