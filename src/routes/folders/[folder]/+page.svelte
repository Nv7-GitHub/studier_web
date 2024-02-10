<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";

    export let data;
    let loading = new Array(data.subfolders.length).fill(false);
    let setLoading = new Array(data.sets.length).fill(false);

    let createFolderLoading = false;

    let title = data.folder?.name;
    let owner = data.folder?.user == data.user?.id;
    if (!owner) {
        title = data.folder?.expand?.user.username + "'s Sets";
    }

    async function copy(e: Event, text: string) {
        let btn = e.currentTarget as HTMLButtonElement;
        (btn.firstChild as HTMLElement).classList.remove("bi-clipboard");
        (btn.firstChild as HTMLElement).classList.add("bi-check2");
        await navigator.clipboard.writeText(text);
        setTimeout(() => {
            (btn.firstChild as HTMLElement).classList.remove("bi-check2");
            (btn.firstChild as HTMLElement).classList.add("bi-clipboard");
        }, 1000);
    }
</script>

{#if data.folder?.parent}
    <div class="mb-3">
        <a href="/folders/{data.folder?.parent}">
            <i class="bi bi-folder-symlink-fill"></i> Back to {data.folder
                ?.expand?.parent.name}</a
        >
    </div>
{/if}

<svelte:head>
    <title>{title} - Studier</title>
</svelte:head>

<h1>{title}</h1>

<form
    method="POST"
    class="input-group mb-3"
    use:enhance={() => {
        createFolderLoading = true;

        return async ({ update }) => {
            createFolderLoading = false;
            update();
        };
    }}
>
    <input type="text" class="form-control" placeholder="Name" name="name" />
    <button
        class="btn btn-outline-secondary"
        formaction="?/newfolder"
        disabled={createFolderLoading}>Create Folder</button
    >
    <button
        class="btn btn-outline-primary"
        formaction="?/newset"
        disabled={createFolderLoading}>Create Set</button
    >
</form>

<div class="list-group">
    {#each data.subfolders as f, i}
        <li class="list-group-item list-group-item-action fs-3">
            <a href="/folders/{f.id}" style="text-decoration: none;"
                ><i class="bi bi-folder"></i>
                {f.name}</a
            >
            <div class="btn-group float-end">
                <button
                    class="btn btn-success"
                    on:click={(e) => {
                        copy(e, f.id);
                    }}
                >
                    <i class="bi bi-clipboard"></i>
                </button>
                {#if owner}
                    <form
                        method="POST"
                        action="?/delfolder"
                        use:enhance={() => {
                            loading[i] = true;

                            return async ({ update }) => {
                                loading[i] = false;
                                update();
                            };
                        }}
                        style="display: inline;"
                    >
                        <button
                            class="btn btn-danger"
                            name="id"
                            value={f.id}
                            disabled={loading[i]}
                            ><i class="bi bi-trash"></i></button
                        >
                    </form>
                {/if}
            </div>
        </li>
    {/each}
</div>

<h2 class="mt-3">Sets</h2>

<div class="list-group">
    {#each data.sets as f, i}
        <li class="list-group-item list-group-item-action fs-3">
            <a href="/set/{f.id}" style="text-decoration: none;"
                ><i class="bi bi-file-earmark"></i>
                {f.title}</a
            >
            <div class="btn-group float-end">
                <a class="btn btn-primary" href={"/study/" + f.id}>
                    <i class="bi bi-play-fill"></i>
                </a>
                <button
                    class="btn btn-success"
                    on:click={(e) => {
                        copy(e, f.id);
                    }}
                >
                    <i class="bi bi-clipboard"></i>
                </button>
                {#if owner}
                    <form
                        method="POST"
                        action="?/delset"
                        use:enhance={() => {
                            setLoading[i] = true;

                            return async ({ update }) => {
                                setLoading[i] = false;
                                update();
                            };
                        }}
                        style="display: inline;"
                    >
                        <button
                            class="btn btn-danger"
                            name="id"
                            value={f.id}
                            disabled={setLoading[i]}
                        >
                            <i class="bi bi-trash"></i>
                        </button>
                    </form>
                {/if}
            </div>
        </li>
    {/each}
</div>
