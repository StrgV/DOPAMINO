<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<form method="POST">
    <input name="username" placeholder="Username" required />
    <input name="email" type="email" placeholder="E-Mail" required />
    <input name="password" type="password" placeholder="Passwort" required />
    <button type="submit" formaction="?/register">Registrieren</button>
</form>