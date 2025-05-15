<script lang="ts">
    import { balanceStore } from "$lib/stores/balanceStore";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    let { data } = $props()

    // Use $state to track the balance from the store
    let localBalance = $state(0);


    // Subscribe to the balance store
    $effect(() => {
        localBalance = $balanceStore;
    });

    // Only set the store value from data if the store is empty
    onMount(() => {
        const currentValue = get(balanceStore);
        if (currentValue === 0) {
            balanceStore.set(data.balance);
        }
    });

</script>

<div class="content">
    <p>Logged in as: {data.username}</p>
    <p>Balance: {localBalance} €</p>
    <p>Enjoy your stay!</p>

    <form method="POST" action="?/logout">
        <button type="submit">Logout</button>
    </form>
</div>