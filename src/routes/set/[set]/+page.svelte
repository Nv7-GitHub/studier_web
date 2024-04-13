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

    /*import upload from "./upload.json";
    if (browser) {
        (document as any)["u"] = uploadSet;
    }
    async function uploadSet() {
        const name = "Chapter 21";
        const folder = "q1k7aw6rmevaud5";
        let qs: string[] = [];
        let set = await pb.collection("sets").create({
            title: name,
            folder: folder,
            author: data.user?.id,
        });
        for (let q of upload) {
            let text = "";
            for (let t of q.Text) {
                if (t.Kind == 0) {
                    text += t.Value;
                } else {
                    text += "`" + t.Value + "`";
                }
            }

            let kind = "single";
            let answer = {};
            if (q.Answer.Answers) {
                if (q.Answer.Order) {
                    kind = "blanks";
                    let answers = [];
                    for (let a of q.Answer.Order) {
                        answers.push({
                            key: a,
                            value: (q.Answer.Answers as any)[a],
                        });
                    }
                    answer = { blanks: answers };
                } else {
                    kind = "multiple";
                    answer = { values: q.Answer.Answers };
                }
            } else {
                answer = { value: q.Answer.Answer };
            }

            while (true) {
                try {
                    let val = await pb.collection("questions").create({
                        set: set.id,
                        question: text,
                        kind: kind,
                        answer: answer,
                    });
                    console.log(text);
                    qs.push(val.id);
                    break;
                } catch (e) {
                    console.log("Waiting...");
                    await new Promise((r) => setTimeout(r, 10000));
                }
            }
        }
        try {
            await pb.collection("sets").update(set.id, { questions: qs });
        } catch (e) {
            console.log("Waiting...");
            await new Promise((r) => setTimeout(r, 10000));
            await pb.collection("sets").update(set.id, { questions: qs });
        }
    }*/

    let qs = new Array(data.set?.expand?.questions.length);
    let makingnew = false;
    async function newquestion() {
        makingnew = true;
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
        makingnew = false;
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

    let owner = data.set?.author == data.user?.id;

    let edittitle = false;
    let editinput: HTMLInputElement;
    let titleval = data.set?.title;
    async function savetitle() {
        if (titleval != data.set?.title) {
            await pb
                .collection("sets")
                .update(data.set!.id, { title: titleval });
        }
        data.set!.title = titleval;
        edittitle = false;
    }
</script>

<svelte:head>
    <title>{data.set?.title} - Studier</title>
</svelte:head>

<a href="/folders/{data.set?.folder}">
    <i class="bi bi-folder-symlink-fill"></i> Back to {data.set?.expand?.folder
        .name}</a
>

<div class="d-flex">
    <div>
        <h1
            class="mt-3 justify-content-start"
            on:click={async () => {
                edittitle = true;
                await tick();
                editinput.focus();
            }}
        >
            {#if edittitle}
                <input
                    type="text"
                    bind:value={titleval}
                    on:blur={savetitle}
                    bind:this={editinput}
                    class="form-control h1"
                    style="font-size: 1.375rem;"
                />
            {:else}
                {data.set?.title}
            {/if}
        </h1>
        <h4 class="text-body-secondary">
            {data.set?.expand?.questions.length} Questions
        </h4>
    </div>
    <div class="ms-auto d-flex flex-column justify-content-center">
        <a class="btn btn-lg btn-primary" href={"/study/" + data.set?.id}
            >Study</a
        >
    </div>
</div>

{#each data.set?.expand?.questions as _, i}
    <Question
        {pb}
        questions={data.set?.expand?.questions}
        ind={i}
        {newquestion}
        {rmquestion}
        {owner}
        bind:focus={qs[i]}
    />
{/each}

{#if owner}
    <div class="text-center mt-3">
        <button
            on:click={newquestion}
            class="btn btn-primary"
            disabled={makingnew}>New Question</button
        >
    </div>
{/if}
