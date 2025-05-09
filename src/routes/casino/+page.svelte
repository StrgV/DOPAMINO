<script lang="ts">
    import logo from "$lib/assets/DOPAMINO_Text_Logo.svg";
    import { balanceStore } from '$lib/stores/balanceStore';
    import { onMount } from 'svelte';

    let {data} = $props();

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

    balanceStore.subscribe(value => balance = value); // Reactively update balance
</script>

<img src="{logo}" alt="Logo of DOPAMINO" class="logo"/>
<h1>Welcome to the Casino</h1>
<p>Logged in as: {data.username}</p>
<p>Balance: {balance} €</p>
<p>Enjoy your stay!</p>

<br><br>
<form method="POST" action="?/logout">
    <button type="submit">Logout</button>
</form>