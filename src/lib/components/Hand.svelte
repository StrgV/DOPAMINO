<script lang="ts">
    import CardComponent from '$lib/components/Card.svelte';

    let { hand } = $props();
    
    const overlap = 50;

</script>


<div class="hand">
    
    {#each hand as card, i}
        {@const marginLeft = i > 0 ? -overlap : 0}
        {@const dynamicStyle = `margin-left: ${marginLeft}px`}

        <CardComponent 
            value={card.value} 
            suit={card.suit} 
            style={dynamicStyle}/>
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