<script lang="ts">
import logo from "$lib/assets/DOPAMINO_Text_Logo.svg";
</script>

<img src="{logo}" alt="Logo of DOPAMINO" />
<h2 class="italic">~wir sind dein Casino</h2>

<form method="POST">
    <input name="username" placeholder="Username" required />
    <input name="email" type="email" placeholder="E-Mail" required />
    <input name="password" type="password" placeholder="Passwort" required />
    <button type="submit" formaction="?/register">Registrieren</button>
</form>