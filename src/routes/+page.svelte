<h1>DOPAMINO</h1>
<h2 class="italic">~wir sind dein Casino</h2>

<form method="POST" action="?/login">
    <input name="username" placeholder="Username" required />
    <!-- <input name="email" type="email" placeholder="E-Mail" required /> -->
    <input name="password" type="password" placeholder="Passwort" required />
    <button type="submit">Sign in</button>
    
</form>

<br><br>
<p>Noch kein Account?</p>
<button style="padding-left: 10px;" on:click={() => window.location.href = '/register'}>Sign up</button>
