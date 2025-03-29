<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<br>
<form method="POST" action="?/login">
    
    <input name="username" placeholder="Username" required />
    <!-- <input name="email" type="email" placeholder="E-Mail" required /> -->
    <input name="password" type="password" placeholder="Passwort" required />
    <button type="submit">Sign in</button>
    
</form>

<br><br>
<p>Noch kein Account?</p>
<button style="padding-left: 10px;" on:click={() => window.location.href = '/register'}>Sign up</button>
