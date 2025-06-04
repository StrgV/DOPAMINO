<script lang="ts">
    import logo from "$lib/assets/DOPAMINO_Text_Logo.svg";
    import { balanceStore } from '$lib/stores/balanceStore';
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    
    
    let { data } = $props();
    
    // Use $state to track the balance from the store
    let balance = $state(0);
    
    // Subscribe to the balance store
    $effect(() => {
        balance = $balanceStore;
    });

    // Only set the store value from data if sotre is empty
    onMount(() => {
        const currentValue = get(balanceStore);
        if (currentValue === 0) {
            balanceStore.set(data.balance);
        }
    });

</script>

<div class="content">
    <img src="{logo}" alt="Logo of DOPAMINO" class="logo"/>
    <h1>Willkommen im Casino</h1>
</div>