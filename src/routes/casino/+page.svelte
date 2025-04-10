<script lang="ts">
    import logo from "$lib/assets/DOPAMINO_Text_Logo.svg";
    export let data: {
        username: string;
        balance: number;
    }
</script>

<img src="{logo}" alt="Logo of DOPAMINO" />
<h1>Welcome to the Casino</h1>
<p>Logged in as: {data.username}</p>
<p>Balance: {data.balance} €</p>
<p>Enjoy your stay!</p>

<br><br>
<!-- Logout button -->
<form method="POST" action="?/logout">
    <button type="submit">Logout</button>
</form>