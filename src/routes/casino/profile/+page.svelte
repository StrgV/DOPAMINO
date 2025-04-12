<script lang="ts">
    export let data:{
        username: string,
        balance: number
    };
</script>

<p>Logged in as: {data.username}</p>
<p>Balance: {data.balance} €</p>