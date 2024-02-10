<script lang="ts">
    import PocketBase, { type RecordModel } from "pocketbase";
    import { onMount, tick } from "svelte";

    export let question: RecordModel;
    export let next: (correct: boolean) => Promise<void>;
    let inp: HTMLInputElement;
    let inpval: string;

    // Parse text
    let parts: string;
    let wrong = false;
    let right = false;
    let wrongval: string;
    $: {
        parts = question.question.split(/(`.+?`)/g);
        wrong = false;
        right = false;
        if (inp) {
            inp.value = "";
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
            } else {
                next(false);
            }
        }

        if (question.kind == "single") {
            if (compare(inpval, question.answer.value)) {
                console.log(inpval, question.answer.value);
                right = true;
                next(true);
            } else {
                wrong = true;
                wrongval = inpval ?? "";
                inp.value = "";
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

    {#if wrong}
        {#if question.kind == "single"}
            That answer was wrong. <br />
            <b>Correct Answer: </b>
            {question.answer.value}<br /><br />
            <b>Your Answer:</b>
            {wrongval}
        {/if}
    {/if}
</div>
