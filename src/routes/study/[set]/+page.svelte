<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { POCKETBASE_URL } from "$lib";
    import Quiz from "$lib/Quiz.svelte";
    import PocketBase, { type RecordModel } from "pocketbase";

    export let data;
    let pb: PocketBase;
    let totalValue = 0;
    let progress = 0;
    let ind = 0;
    let questions: RecordModel[] = [];

    if (browser) {
        load();
    }

    let loading = true;
    async function load() {
        pb = new PocketBase(POCKETBASE_URL);
        pb.authStore.loadFromCookie(document.cookie);

        // Load questions
        async function addQuestion(question: RecordModel) {
            if (question.include != "") {
                let q = await pb.collection("questions").getOne(question.id, {
                    expand: "include,include.questions",
                });
                for (let i = 0; i < q.expand?.include.questions.length; i++) {
                    addQuestion(q.expand?.include.expand.questions[i]);
                }
            } else {
                questions.push(question);
            }
        }
        for (let i = 0; i < data.set?.questions.length; i++) {
            await addQuestion(data.set?.expand?.questions[i]);
        }

        // Calculate starting index & progress
        while (progressHas(questions[ind].id)) {
            ind++;
        }
        totalValue = questions.reduce((acc, q) => acc + questionValue(q), 0);
        if (data.progress) {
            for (let v of data.progress.finished) {
                let q = questions.find((q) => q.id == v);
                if (q) {
                    progress += questionValue(q);
                }
            }
        } else {
            let p = JSON.parse(
                window.localStorage.getItem("progress-" + data.set?.id)!,
            );
            for (let v of p) {
                let q = questions.find((q) => q.id == v);
                if (q) {
                    progress += questionValue(q);
                }
            }
        }

        loading = false;
    }

    function progressHas(question: string) {
        if (data.progress) {
            return data.progress.finished.includes(question);
        }
        if (!window.localStorage.getItem("progress-" + data.set?.id)) {
            window.localStorage.setItem("progress-" + data.set?.id, "[]");
        }
        return JSON.parse(
            window.localStorage.getItem("progress-" + data.set?.id)!,
        ).includes(question);
    }
    function questionValue(question: RecordModel): number {
        if (question.kind == "single") {
            return 1;
        }
        if (question.kind == "multiple") {
            return question.answer.values.length;
        }
        if (question.kind == "blanks") {
            return question.answer.blanks.length;
        }
        return 0;
    }

    // Interactivity
    async function next(correct: boolean) {
        if (correct) {
            if (data.progress) {
                data.progress.finished.push(questions[ind].id);
                await pb.collection("progress").update(data.progress!.id, {
                    finished: data.progress.finished,
                });
            } else {
                let p = JSON.parse(
                    window.localStorage.getItem("progress-" + data.set?.id)!,
                );
                p.push(questions[ind].id);
                window.localStorage.setItem(
                    "progress-" + data.set?.id,
                    JSON.stringify(p),
                );
            }

            progress += questionValue(questions[ind]);
        }

        // Check if done
        if (progress >= totalValue) {
            if (data.progress) {
                await pb.collection("progress").delete(data.progress.id);
                data.progress.finished = [];
            } else {
                window.localStorage.removeItem("progress-" + data.set?.id);
            }
            alert("Done!");
            await goto(`/folders/${data.set?.folder}`);
            return;
        }

        // Next question
        ind++;
        if (ind >= questions.length) {
            ind = 0;
        }
        while (progressHas(questions[ind].id)) {
            ind++;
            if (ind >= questions.length) {
                ind = 0;
            }
        }
    }
</script>

<svelte:head>
    <title>{data.set?.title} - Studier</title>
</svelte:head>

{#if loading}
    <div class="loader">
        <div
            class="spinner-border text-primary"
            style="width: 3rem; height: 3rem;"
            role="status"
        >
            <span class="visually-hidden">Loading questions...</span>
        </div>
    </div>
{:else}
    <div class="progress mb-4">
        <div
            class="progress-bar progress-bar-striped progress-bar-animated"
            style="width: {(progress / totalValue) * 100}%;"
        >
            {Math.round((progress / totalValue) * 100)}%
        </div>
    </div>

    <Quiz question={questions[ind]} {next} />
{/if}

<style>
    .loader {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>
