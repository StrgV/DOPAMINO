<script lang="ts">
    import type { FailResponse } from '$lib/types';
    export let form: FailResponse;
</script>


<h1>Register</h1>
<form method="POST" action="?/register">
    <div class="column">
        <input name="forename" placeholder="Name" value="{form?.values?.forename}" required />
        <input name="name" placeholder="name" value="{form?.values?.name}" required />
        <input name="username" placeholder="Username" value="{form?.values?.username}" required />
        <input name="email" type="email" placeholder="E-Mail" value="{form?.values?.email}" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Sign up</button>
    </div>
</form>

<!-- Fehlermeldung anzeigen -->
{#if form?.error}
    <p style="color: red;">{form.error}</p>
{/if}