<script lang="ts">
    import PocketBase, { type RecordModel } from "pocketbase";
    import { tick } from "svelte";
    export let pb: PocketBase;
    export let questions: RecordModel[];
    export let ind: number;
    export let newquestion: () => Promise<void>;
    export let rmquestion: (ind: number) => Promise<void>;
    export let focus: HTMLInputElement =
        undefined as unknown as HTMLInputElement;

    export let inputs: HTMLInputElement[] = [];

    async function edit() {
        await pb.collection("questions").update(questions[ind].id, {
            question: questions[ind].question,
            kind: questions[ind].kind,
            answer: questions[ind].answer,
            include: questions[ind].include,
        });
    }

    async function handleValueInput(e: KeyboardEvent) {
        if (e.key == "Enter") {
            questions[ind].kind = "multiple";
            questions[ind].answer = {
                values: [questions[ind].answer.value, ""],
            };
            inputs = new Array(2);
            edit();
            await tick();
            inputs[1].focus();
        }

        if (e.key == "Tab") {
            e.preventDefault();
            newquestion();
        }
    }

    async function handleMultipleInput(e: KeyboardEvent) {
        let t = e.target as HTMLInputElement;
        if (e.key == "Enter") {
            questions[ind].kind = "multiple";
            questions[ind].answer.values.push("");
            inputs.push(undefined as unknown as HTMLInputElement);
            edit();
            await tick();
            inputs[inputs.length - 1].focus();
        }

        if (e.key == "Backspace" && t.value == "") {
            e.preventDefault();
            if (questions[ind].answer.values.length > 2) {
                let i = parseInt(t.id);
                questions[ind].answer.values.splice(i, 1);
                inputs.splice(i, 1);
                edit();
                await tick();
                inputs[i > 0 ? i - 1 : 0].focus();
            } else {
                questions[ind].kind = "single";
                questions[ind].answer = { value: inputs[0].value };
                inputs = [undefined as unknown as HTMLInputElement];
                edit();
                await tick();
                inputs[0].focus();
            }
        }

        if (e.key == "Tab" && parseInt(t.id) == inputs.length - 1) {
            e.preventDefault();
            newquestion();
        }
    }

    async function handleTitleInput(e: KeyboardEvent) {
        let t = e.target as HTMLInputElement;
        if (e.key == "Backspace" && t.value == "") {
            e.preventDefault();
            rmquestion(ind);
        }
    }
</script>

<div class="card mt-3">
    <div class="card-body">
        <div class="card-title input-group">
            <input
                class="form-control"
                bind:value={questions[ind].question}
                on:change={edit}
                bind:this={focus}
                on:keydown={handleTitleInput}
                placeholder="Question"
            />
        </div>
        <h6 class="card-subtitle mb-2 text-body-secondary mt-3">Answer</h6>

        {#if questions[ind].kind == "single"}
            <input
                class="form-control"
                placeholder="Answer"
                on:change={edit}
                on:keydown={handleValueInput}
                bind:value={questions[ind].answer.value}
                bind:this={inputs[0]}
            />
        {:else if questions[ind].kind == "multiple"}
            {#each questions[ind].answer.values as _, i}
                <input
                    id={i.toString()}
                    class="form-control"
                    placeholder="Answer"
                    on:change={edit}
                    on:keydown={handleMultipleInput}
                    bind:value={questions[ind].answer.values[i]}
                    bind:this={inputs[i]}
                />
            {/each}
        {:else if questions[ind].kind == "blanks"}
            TODO
        {:else if questions[ind].kind == "include"}
            TODO
        {/if}
    </div>
</div>
