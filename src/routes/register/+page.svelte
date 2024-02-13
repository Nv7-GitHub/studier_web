<script lang="ts">
    import { enhance } from "$app/forms";

    export let form;

    function hasError(formDat: any, field: string) {
        return formDat && formDat[field];
    }

    let loading = false;
</script>

<svelte:head>
    <title>Register - Studier</title>
</svelte:head>

<h1>Register</h1>

<form
    method="post"
    use:enhance={() => {
        loading = true;

        return async ({ update }) => {
            loading = false;
            update();
        };
    }}
>
    <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input
            type="text"
            name="username"
            class="form-control"
            class:is-invalid={hasError(form, "username")}
            id="username"
        />
        {#if hasError(form, "username")}
            <div class="invalid-feedback">{form?.["username"].message}</div>
        {/if}
    </div>
    <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
            type="email"
            name="email"
            class="form-control"
            id="email"
            class:is-invalid={hasError(form, "email")}
        />
        {#if hasError(form, "email")}
            <div class="invalid-feedback">{form?.["email"].message}</div>
        {/if}
    </div>
    <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
            type="password"
            name="password"
            class="form-control"
            id="password"
            class:is-invalid={hasError(form, "password")}
        />
        {#if hasError(form, "password")}
            <div class="invalid-feedback">{form?.["password"].message}</div>
        {/if}
    </div>
    <div class="mb-3">
        Already have an account? <a href="/login">Login</a>
    </div>
    <button type="submit" class="btn btn-primary" disabled={loading}
        >Register</button
    >
</form>
