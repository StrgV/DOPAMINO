<h1>Register</h1>
<form method="POST" action="?/register">
    <div class="column">
        <!-- TODO: Change forename, name to Name, Surname -->
        <input name="forename" placeholder="Name" required />
        <input name="name" placeholder="name" required />
        <input name="username" placeholder="Username" required />
        <input name="email" type="email" placeholder="E-Mail" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Sign up</button>
    </div>
</form>