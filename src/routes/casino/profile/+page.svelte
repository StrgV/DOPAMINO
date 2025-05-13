<script lang="ts">
    import { balanceStore } from "$lib/stores/balanceStore";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    //export let data: { username: string; };
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

<p>Logged in as: {data.username}</p>
<p>Balance: {localBalance} €</p>