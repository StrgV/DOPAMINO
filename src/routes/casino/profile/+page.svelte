<script lang="ts">
    import { balanceStore } from '$lib/stores/balanceStore';
    import { onMount } from 'svelte';

    //export let data: { username: string; };
    let { data } = $props()

    let balance = $state(0);

    onMount(async () => {
        const res = await fetch('/api/get-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: data.username })
        });
        const result = await res.json();
        if (result.success) {
            balanceStore.set(result.balance); // Update the store with the latest balance
        }
    });

    balanceStore.subscribe(value => balance = value); 
</script>

<p>Logged in as: {data.username}</p>
<p>Balance: {balance} €</p>