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
        const folder = "4lnxyx0qfxt1xwt";
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
        await pb.collection("sets").update(set.id, { questions: qs });
    }*/

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

    let owner = data.set?.author == data.user?.id;
</script>

<svelte:head>
    <title>{data.set?.title} - Studier</title>
</svelte:head>

<a href="/folders/{data.set?.folder}">
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
        {owner}
        bind:focus={qs[i]}
    />
{/each}
