<script lang="ts">
    export let form;
</script>

<h1>Login</h1>

<form method="post">
    <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input
            type="text"
            name="username"
            class="form-control"
            class:is-invalid={form}
            id="username"
        />
        {#if form}
            <div class="invalid-feedback">{form?.message}</div>
        {/if}
    </div>
    <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
            type="password"
            name="password"
            class="form-control"
            id="password"
        />
    </div>
    <div class="mb-3">
        Already have an account? <a href="/register">Register</a>
    </div>
    <button type="submit" class="btn btn-primary">Login</button>
</form>
