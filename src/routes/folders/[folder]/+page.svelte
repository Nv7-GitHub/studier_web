<script lang="ts">
    import { enhance } from "$app/forms";
    import { afterUpdate } from "svelte";

    export let data;
    let loading = new Array(data.subfolders.length).fill(false);
    let renameLoading = new Array(data.subfolders.length).fill(false);
    let moveLoading = new Array(data.subfolders.length).fill(false);

    let setLoading = new Array(data.sets.length).fill(false);
    let setMoveLoading = new Array(data.sets.length).fill(false);

    let createFolderLoading = false;

    let title: string;
    $: title = data.folder?.name;
    let owner: boolean;
    $: {
        owner = data.folder?.user == data.user?.id;
        if (!owner && !data.folder?.parent) {
            title = data.folder?.expand?.user.username + "'s Sets";
        }
    }

    function updatetooltips() {
        const tooltipTriggerList = document.querySelectorAll(
            '[data-bs-toggle="tooltip"]',
        );
        [...tooltipTriggerList].map(
            (tooltipTriggerEl) =>
                new globalThis.bootstrap.Tooltip(tooltipTriggerEl),
        );
    }
    afterUpdate(updatetooltips);

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

    function confirm(e: Event, text: string) {
        if (window.confirm(`Are you sure you want to delete "${text}"?`)) {
            return;
        }
        e.preventDefault();
    }

    async function renameFolder(e: Event, oldTitle: string, id: string) {
        let res = window.prompt(`What do you want to rename "${oldTitle}" to?`);
        if (!res) {
            e.preventDefault();
            return;
        }
        (document.getElementById("rename" + id) as HTMLButtonElement).value =
            res;
    }

    async function moveFolder(e: Event, title: string, id: string) {
        let res = window.prompt(`Where do you want to move "${title}" to?`);
        if (!res) {
            e.preventDefault();
            return;
        }
        (document.getElementById("move" + id) as HTMLButtonElement).value = res;
    }

    async function moveSet(e: Event, title: string, id: string) {
        let res = window.prompt(`Where do you want to move "${title}" to?`);
        if (!res) {
            e.preventDefault();
            return;
        }
        (document.getElementById("moveSet" + id) as HTMLButtonElement).value =
            res;
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

{#if owner}
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
        <input
            type="text"
            class="form-control"
            placeholder="Name"
            name="name"
        />
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
{/if}

<div class="list-group">
    {#each data.subfolders as f, i}
        <li class="list-group-item list-group-item-action fs-3">
            <a href="/folders/{f.id}" style="text-decoration: none;"
                ><i class="bi bi-folder"></i>
                {f.name}</a
            >

            <form
                method="POST"
                use:enhance={() => {
                    loading[i] = true;

                    return async ({ update }) => {
                        loading[i] = false;
                        renameLoading[i] = false;
                        update();
                    };
                }}
                style="display: inline;"
            >
                <div class="btn-group float-end">
                    <button
                        class="btn btn-success"
                        data-bs-toggle="tooltip"
                        data-bs-title="Copy ID"
                        on:click|preventDefault={(e) => {
                            copy(e, f.id);
                        }}
                    >
                        <i class="bi bi-clipboard"></i>
                    </button>
                    {#if owner}
                        <input type="hidden" name="id" value={f.id} />
                        <button
                            class="btn btn-primary"
                            name="name"
                            formaction="?/renamefolder"
                            id={"rename" + f.id}
                            type="submit"
                            disabled={renameLoading[i] && loading[i]}
                            data-bs-toggle="tooltip"
                            data-bs-title="Rename folder"
                            on:click={(e) => {
                                renameFolder(e, f.name, f.id);
                                renameLoading[i] = true;
                            }}><i class="bi bi-pencil-square"></i></button
                        >
                        <button
                            class="btn btn-warning"
                            name="target"
                            formaction="?/movefolder"
                            id={"move" + f.id}
                            type="submit"
                            disabled={moveLoading[i] && loading[i]}
                            data-bs-toggle="tooltip"
                            data-bs-title="Move folder"
                            on:click={(e) => {
                                moveFolder(e, f.name, f.id);
                                moveLoading[i] = true;
                            }}><i class="bi bi-folder-symlink"></i></button
                        >
                        <button
                            class="btn btn-danger"
                            type="submit"
                            formaction="?/delfolder"
                            disabled={loading[i] &&
                                !renameLoading[i] &&
                                !moveLoading[i]}
                            data-bs-toggle="tooltip"
                            data-bs-title="Delete folder"
                            on:click={(e) => {
                                confirm(e, f.name);
                            }}><i class="bi bi-trash"></i></button
                        >
                    {/if}
                </div>
            </form>
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
                <div class="btn-group float-end">
                    <a
                        class="btn btn-primary"
                        href={"/study/" + f.id}
                        data-bs-toggle="tooltip"
                        data-bs-title="Study set"
                    >
                        <i class="bi bi-play-fill"></i>
                    </a>
                    <a
                        class="btn btn-warning"
                        href={"/download/" + f.id}
                        download={f.title + ".txt"}
                        data-bs-toggle="tooltip"
                        data-bs-title="Download set"
                    >
                        <i class="bi bi-download"></i>
                    </a>
                    <button
                        class="btn btn-success"
                        data-bs-toggle="tooltip"
                        data-bs-title="Copy ID"
                        on:click|preventDefault={(e) => {
                            copy(e, f.id);
                        }}
                    >
                        <i class="bi bi-clipboard"></i>
                    </button>
                    {#if owner}
                        <input type="hidden" name="id" value={f.id} />
                        <button
                            class="btn btn-info"
                            name="target"
                            formaction="?/moveset"
                            id={"moveSet" + f.id}
                            type="submit"
                            disabled={setMoveLoading[i] && setLoading[i]}
                            data-bs-toggle="tooltip"
                            data-bs-title="Move set"
                            on:click={(e) => {
                                moveSet(e, f.title, f.id);
                                setMoveLoading[i] = true;
                            }}><i class="bi bi-file-arrow-up"></i></button
                        >
                        <button
                            class="btn btn-danger"
                            disabled={setLoading[i] && !moveLoading[i]}
                            data-bs-toggle="tooltip"
                            data-bs-title="Delete set"
                            on:click={(e) => confirm(e, f.title)}
                        >
                            <i class="bi bi-trash"></i>
                        </button>
                    {/if}
                </div>
            </form>
        </li>
    {/each}
</div>
