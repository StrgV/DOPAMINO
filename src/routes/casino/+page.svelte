<script lang="ts">
    import logo from "$lib/assets/DOPAMINO_Text_Logo.svg";
    import { balanceStore } from '$lib/stores/balanceStore';
    
    let { data } = $props();
    
    // Use $state to track the balance from the store
    let balance = $state(data.balance);
    // let currentBalance = $state(0);
    
    // Subscribe to the balance store
    $effect(() => {
        const unsubscribe = balanceStore.subscribe(value => {
            balance = value;
        });
        
        return unsubscribe;
    });
    

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