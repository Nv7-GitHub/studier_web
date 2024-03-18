<script lang="ts">
    import { enhance } from "$app/forms";

    export let data;
    let loading = new Array(data.progress.length).fill(false);

    function confirm(e: Event, text: string) {
        if (
            window.confirm(
                `Are you sure you want to reset your progress in "${text}"?`,
            )
        ) {
            return;
        }
        e.preventDefault();
    }
</script>

<svelte:head>
    <title>In Progress - Studier</title>
</svelte:head>

<h1>In Progress</h1>

<div class="list-group">
    {#each data.progress as p, i}
        <li class="list-group-item list-group-item-action fs-3">
            <a href="/study/{p.set}" style="text-decoration: none;"
                ><i class="bi bi-folder"></i>
                {p.expand?.set.title}</a
            >
            <form
                method="POST"
                action="?/del"
                use:enhance={() => {
                    loading[i] = true;

                    return async ({ update }) => {
                        loading[i] = false;
                        update();
                    };
                }}
                style="display: inline;"
            >
                <div class="btn-group float-end">
                    <button
                        class="btn btn-danger"
                        name="id"
                        value={p.id}
                        disabled={loading[i]}
                        on:click={(e) => {
                            confirm(e, p.expand?.set.title);
                        }}><i class="bi bi-trash"></i></button
                    >
                </div>
            </form>
        </li>
    {/each}
</div>
