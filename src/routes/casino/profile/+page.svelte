<script lang="ts">
    import { balanceStore } from "$lib/stores/balanceStore";
    //export let data: { username: string; };
    let { data } = $props()

    // Use $state to track the balance from the store
    let localBalance = $state(data.balance);


    // Subscribe to the balance store
    $effect(() => {
        const resubscribe = balanceStore.subscribe(value => {
            localBalance = value;
        });
        
        return resubscribe;
    });
</script>

<p>Logged in as: {data.username}</p>
<p>Balance: {localBalance} €</p>