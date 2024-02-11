<script lang="ts">
    import { browser } from "$app/environment";
    import PocketBase, { type RecordModel } from "pocketbase";
    import { onMount } from "svelte";

    export let question: RecordModel;
    export let pb: PocketBase;
    let oldid = "";
    export let next: (correct: boolean) => Promise<void>;
    async function transitionNext(correct: boolean) {
        opacity = 0;
        await next(correct);
        opacity = 100;
    }
    let opacity = 100;

    let inp: HTMLInputElement;
    let inpval: string;

    // Parse text
    let parts: string;
    let wrong = false;
    let right = false;
    let wrongval: string;
    let answered: string[] = [];
    let blanksanswered: Record<string, string> = {};
    $: {
        if (oldid != question.id) {
            oldid = question.id;
            parts = question.question.split(/(`.+?`)/g);
            wrong = false;
            right = false;
            answered = [];
            blanksanswered = {};
            if (inp) {
                inpval = "";
            }
        }
    }

    onMount(() => {
        inp.focus();
    });

    function onkeydown(e: KeyboardEvent) {
        if (e.key == "Enter") {
            submit();
        }
    }

    function compare(a: string, b: string) {
        if (!a) {
            a = "";
        }
        if (!b) {
            b = "";
        }
        return a.trim().toLowerCase() == b.trim().toLowerCase();
    }

    function submit() {
        if (wrong) {
            if (question.kind == "multiple") {
                transitionNext(false);
                return;
            }

            if (inpval.toLowerCase().startsWith("y")) {
                if (question.kind == "single") {
                    wrong = false;
                    right = true;
                    transitionNext(true);
                } else {
                    // Blanks
                    let ans =
                        question.answer.blanks[
                            Object.keys(blanksanswered).length
                        ];
                    blanksanswered[ans.key] = ans.value;
                    inpval = "";
                    if (
                        Object.keys(blanksanswered).length ==
                        question.answer.blanks.length
                    ) {
                        right = true;
                        transitionNext(true);
                        return;
                    }
                    wrong = false;
                }
                return;
            } else {
                transitionNext(false);
                return;
            }
        }

        if (question.kind == "single") {
            if (compare(inpval, question.answer.value)) {
                right = true;
                transitionNext(true);
                return;
            } else {
                wrong = true;
                wrongval = inpval ?? "";
                inpval = "";
                return;
            }
        }

        if (question.kind == "multiple") {
            let correct = false;
            for (let ans of question.answer.values) {
                if (compare(inpval, ans)) {
                    // Check if already answered
                    let already = false;
                    for (let a of answered) {
                        if (compare(a, ans)) {
                            already = true;
                            break;
                        }
                    }
                    if (!already) {
                        correct = true;
                        break;
                    }
                }
            }
            if (correct) {
                answered = [...answered, inpval];
                inpval = "";

                if (answered.length == question.answer.values.length) {
                    right = true;
                    transitionNext(true);
                    return;
                }

                return;
            } else {
                wrong = true;
                wrongval = inpval ?? "";
                return;
            }
        }

        if (question.kind == "blanks") {
            let ans =
                question.answer.blanks[Object.keys(blanksanswered).length];
            if (compare(inpval, ans.value)) {
                blanksanswered[ans.key] = inpval;
                inpval = "";
                if (
                    Object.keys(blanksanswered).length ==
                    question.answer.blanks.length
                ) {
                    right = true;
                    transitionNext(true);
                    return;
                }
                return;
            } else {
                wrong = true;
                wrongval = inpval ?? "";
                inpval = "";
                return;
            }
        }
    }
</script>

<div
    class="text-center"
    style="opacity: {opacity}%; transition-duration: 0.2s;"
>
    {#if question.image && browser}
        <img
            src={pb.getFileUrl(question, question.image)}
            alt="Question"
            class="img-fluid"
        />
    {/if}
    <h2 class="lead">
        {#each parts as p}
            {#if p[0] == "`"}
                {#if blanksanswered[p.slice(1, -1)]}
                    <code>{blanksanswered[p.slice(1, -1)]}</code>
                {:else}
                    <code>{p.slice(1, -1)}</code>
                {/if}
            {:else}
                {p}
            {/if}
        {/each}
    </h2>

    <div class="input-group">
        {#if question.kind == "blanks" && Object.keys(blanksanswered).length < question.answer.blanks.length}
            <span class="input-group-text"
                >{question.answer.blanks[Object.keys(blanksanswered).length]
                    .key}</span
            >
        {/if}
        <input
            type="text"
            class="form-control"
            placeholder="Your answer here"
            bind:value={inpval}
            bind:this={inp}
            class:is-invalid={wrong}
            class:is-valid={right}
            on:keydown={onkeydown}
        />
        {#if wrong}
            <div class="invalid-feedback text-start">
                {question.kind != "multiple"
                    ? "Typo? Y/N"
                    : "Press ENTER to continue"}
            </div>
        {/if}
    </div>

    {#if question.kind == "multiple" && !wrong}
        <h3 class="mt-3">Your Answers</h3>
        <ul class="list-group">
            {#each answered as a}
                <li class="list-group-item">{a}</li>
            {/each}
        </ul>
    {/if}

    {#if wrong}
        {#if question.kind == "single"}
            <h3>Your Answer</h3>
            {wrongval}

            <h3>Correct Answer</h3>
            {question.answer.value}
        {:else if question.kind == "multiple"}
            <h3>Your Answer</h3>
            {wrongval}

            <h3>Correct Answers</h3>
            <ul class="list-group">
                {#each question.answer.values as a}
                    <li class="list-group-item">{a}</li>
                {/each}
            </ul>
        {:else if question.kind == "blanks"}
            <h3>Your Answer</h3>
            {wrongval}

            <h3>Correct Answer</h3>
            {#if Object.keys(blanksanswered).length < question.answer.blanks.length}
                {question.answer.blanks[Object.keys(blanksanswered).length]
                    .value}
            {/if}
        {/if}
    {/if}
</div>
