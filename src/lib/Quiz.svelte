<script lang="ts">
    import PocketBase, { type RecordModel } from "pocketbase";
    import { onMount, tick } from "svelte";

    export let question: RecordModel;
    let oldid = "";
    export let next: (correct: boolean) => Promise<void>;

    let inp: HTMLInputElement;
    let inpval: string;

    // Parse text
    let parts: string;
    let wrong = false;
    let right = false;
    let wrongval: string;
    let answered: string[] = [];
    $: {
        if (oldid != question.id) {
            oldid = question.id;
            parts = question.question.split(/(`.+?`)/g);
            wrong = false;
            right = false;
            answered = [];
            if (inp) {
                inp.value = "";
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
            if (inpval.toLowerCase().startsWith("y")) {
                wrong = false;
                right = true;
                next(true);
                return;
            } else {
                next(false);
                return;
            }
        }

        if (question.kind == "single") {
            if (compare(inpval, question.answer.value)) {
                console.log(inpval, question.answer.value);
                right = true;
                next(true);
                return;
            } else {
                wrong = true;
                wrongval = inpval ?? "";
                inp.value = "";
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
                inp.value = "";

                if (answered.length == question.answer.values.length) {
                    right = true;
                    next(true);
                    return;
                }

                return;
            } else {
                wrong = true;
                wrongval = inpval ?? "";
                return;
            }
        }
    }
</script>

<div class="text-center">
    <h2 class="lead">
        {#each parts as p}
            {#if p[0] == "`"}
                <code>{p.slice(1, -1)}</code>
            {:else}
                {p}
            {/if}
        {/each}
    </h2>

    {#if !wrong || question.kind == "single" || question.kind == "blanks"}
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
            <div class="invalid-feedback text-start">Typo? Y/N</div>
        {/if}
    {/if}

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
        {/if}
    {/if}
</div>
