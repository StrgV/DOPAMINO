<script lang="ts">

    export let value: string;
    export let suit: string;

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

<div class="card">
    <img src={imagePath} alt={`Playing card: ${value}${suit}`} />
</div>

<style>
    .card img {
        display: flex; 
        width: auto;
        height: auto;
        filter: drop-shadow(0px 10px 10px black);
    }
</style>
