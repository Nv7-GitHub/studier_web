<script lang="ts">
    import { POCKETBASE_URL } from "$lib";
    import PocketBase from "pocketbase";
    import { browser } from "$app/environment";
    import Question from "$lib/Question.svelte";
    import { tick } from "svelte";

    export let data;
    let pb: PocketBase;

    if (browser) {
        pb = new PocketBase(POCKETBASE_URL);
        pb.authStore.loadFromCookie(document.cookie);
    }

    let qs = new Array(data.set?.expand?.questions.length);
    async function newquestion() {
        const q = await pb.collection("questions").create({
            set: data.set?.id,
            question: "",
            kind: "single",
            answer: { value: "" },
        });
        data.set?.expand?.questions.push(q);
        data.set!.expand!.questions = data.set?.expand?.questions; // Make svelte happy
        data.set?.questions.push(q.id);
        pb.collection("sets").update(data.set!.id, {
            questions: data.set?.questions,
        });
        qs.push(undefined as unknown as Question);
        await tick();

        while (qs.length > data.set?.expand?.questions.length) {
            qs.pop(); // Why does null and undefined keep getting added to the end???
        }
        qs[qs.length - 1].focus();
    }

    async function rmquestion(ind: number) {
        await pb
            .collection("questions")
            .delete(data.set?.expand?.questions[ind].id);
        data.set?.expand?.questions.splice(ind, 1);
        data.set?.questions.splice(ind, 1);
        data.set!.expand!.questions = data.set?.expand?.questions; // Make svelte happy
        pb.collection("sets").update(data.set!.id, {
            questions: data.set?.questions,
        });
        qs.splice(ind, 1);
        await tick();

        qs[ind - 1 < 0 ? 0 : ind - 1].focus();
    }
</script>

<a href="/edit/folders/{data.set?.folder}">
    <i class="bi bi-folder-symlink-fill"></i> Back to {data.set?.expand?.folder
        .name}</a
>

<h1 class="mt-3">{data.set?.title}</h1>

{#each data.set?.expand?.questions as _, i}
    <Question
        {pb}
        questions={data.set?.expand?.questions}
        ind={i}
        {newquestion}
        {rmquestion}
        bind:focus={qs[i]}
    />
{/each}
