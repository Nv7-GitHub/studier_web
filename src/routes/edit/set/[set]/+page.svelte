<script lang="ts">
    import { POCKETBASE_URL } from "$lib";
    import PocketBase from "pocketbase";
    import { browser } from "$app/environment";
    import Question from "$lib/Question.svelte";

    export let data;
    let pb: PocketBase;

    if (browser) {
        pb = new PocketBase(POCKETBASE_URL);
        pb.authStore.loadFromCookie(document.cookie);
    }
</script>

<a href="/edit/folders/{data.set?.folder}">
    <i class="bi bi-folder-symlink-fill"></i> Back to {data.set?.expand?.folder
        .name}</a
>

<h1 class="mt-3">{data.set?.title}</h1>

{#each data.set?.expand?.questions as question, i}
    <Question {pb} questions={data.set?.expand?.questions} ind={i} />
{/each}
