<script lang="ts">
    import Card from '$lib/components/Card.svelte';

    let { hand } = $props();
    const overlap = 30;
</script>


<div class="hand">
    
    <!-- For each card in hand -->
    {#each hand as card, i}
        {@const marginLeft = i > 0 ? -overlap : 0}
        {@const dynamicStyle = `margin-left: ${marginLeft}px`}

        <!-- Display card -->
        <Card value={card.value} suit={card.suit} style={dynamicStyle}/>

    {/each}
    
</div>

<style>
    .hand{
        display: flex;
        height: 100%;
        width: 100%;
        padding: 1rem;
        align-items: center;
        justify-content: center;
    }
</style>