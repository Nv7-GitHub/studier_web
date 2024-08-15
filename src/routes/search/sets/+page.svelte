<script lang="ts">
    import PocketBase, { type RecordModel, type ListResult } from "pocketbase";
    import { POCKETBASE_URL } from "$lib";
    import { onMount } from "svelte";

    let pb = new PocketBase(POCKETBASE_URL);
    let res: ListResult<RecordModel>;
    let inpval = "";

    let loading = false;
    async function search() {
        loading = true;
        let filter = "";
        if (inpval != "") {
            filter = `title ~ "${inpval}"`;
        }
        res = await pb
            .collection("sets")
            .getList(0, 50, { filter, sort: "-updated" });
        loading = false;
    }

    onMount(search);
</script>

<svelte:head>
    <title>Search Sets - Studier</title>
</svelte:head>

<h1>Search Sets</h1>
<form class="input-group">
    <input
        type="text"
        class="form-control"
        placeholder="Search"
        id="search-input"
        bind:value={inpval}
    />
    <button
        type="submit"
        class="btn btn-outline-success"
        disabled={loading}
        on:click|preventDefault={search}
    >
        <i class="bi bi-search"></i>
    </button>
</form>

{#if res}
    <ul class="list-group mt-3">
        {#each res.items as set}
            <a
                href={`/set/${set.id}`}
                class="list-group-item list-group-item-action">{set.title}</a
            >
        {/each}
    </ul>
{/if}
