<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<svelte:head>
    <title>Studier</title>
</svelte:head>

<nav class="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="/">Studier</a>
        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#dropdown"
            aria-controls="dropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="dropdown">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item dropdown">
                    <button
                        class="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Search
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                            <a class="dropdown-item" href="/search/users"
                                >Users</a
                            >
                        </li>
                        <li>
                            <a class="dropdown-item" href="/search/sets">Sets</a
                            >
                        </li>
                    </ul>
                </li>
                <li class="nav-item dropdown">
                    {#if data.user}
                        <button
                            class="nav-link dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            {data.user.username}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a
                                    class="dropdown-item"
                                    href="/folders/{data.user.home}">My Sets</a
                                >
                            </li>
                            <li>
                                <a class="dropdown-item" href="/progress"
                                    >In Progress</a
                                >
                            </li>
                            <li>
                                <hr class="dropdown-divider" />
                            </li>
                            <li>
                                <a class="dropdown-item" href="/logout"
                                    >Logout</a
                                >
                            </li>
                        </ul>
                    {:else}
                        <a class="nav-link" href="/login">Login</a>
                    {/if}
                </li>
            </ul>
        </div>
    </div>
</nav>

<div class="container mt-3 mb-4">
    <slot />
</div>
