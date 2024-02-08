<script lang="ts">
    import { enhance } from "$app/forms";

    export let data;
    let loading = new Array(data.subfolders.length).fill(false);
    let setLoading = new Array(data.sets.length).fill(false);

    let createFolderLoading = false;
</script>

{#if data.folder?.parent}
    <div class="mb-3">
        <a href="/edit/folders/{data.folder?.parent}">
            <i class="bi bi-folder-symlink-fill"></i> Back to {data.folder
                ?.expand?.parent.name}</a
        >
    </div>
{/if}

<h1>{data.folder?.name}</h1>

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
            <a href="/edit/folders/{f.id}" style="text-decoration: none;"
                ><i class="bi bi-folder"></i>
                {f.name}</a
            >
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
                    class="btn btn-danger btn float-end"
                    name="id"
                    value={f.id}
                    disabled={loading[i]}><i class="bi bi-trash"></i></button
                >
            </form>
        </li>
    {/each}
</div>

<h2 class="mt-3">Sets</h2>

<div class="list-group">
    {#each data.sets as f, i}
        <li class="list-group-item list-group-item-action fs-3">
            <a href="/edit/set/{f.id}" style="text-decoration: none;"
                ><i class="bi bi-file-earmark"></i>
                {f.title}</a
            >
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
                    class="btn btn-danger btn float-end"
                    name="id"
                    value={f.id}
                    disabled={setLoading[i]}><i class="bi bi-trash"></i></button
                >
            </form>
        </li>
    {/each}
</div>
