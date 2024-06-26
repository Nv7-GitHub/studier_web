<script lang="ts">
    import PocketBase, { type RecordModel } from "pocketbase";
    import { browser } from "$app/environment";
    import { tick } from "svelte";
    export let pb: PocketBase;
    export let questions: RecordModel[];
    export let ind: number;
    export let newquestion: () => Promise<void>;
    export let rmquestion: (ind: number) => Promise<void>;
    export let focus: HTMLInputElement =
        undefined as unknown as HTMLInputElement;

    export let inputs: HTMLInputElement[] = [];
    export let owner: boolean;

    async function edit() {
        try {
            let res = await pb.collection("questions").update(
                questions[ind].id,
                {
                    question: questions[ind].question,
                    kind: questions[ind].kind,
                    answer: questions[ind].answer,
                    include: questions[ind].include,
                },
                {
                    expand: "include,include.author",
                },
            );
            if (res.include) {
                questions[ind].expand = res.expand;
            }
        } catch (e) {
            console.log("autocancel");
        }
    }

    let fileInput: HTMLInputElement;
    async function editImage() {
        const formData = new FormData();
        if (fileInput.files && fileInput.files.length == 1) {
            formData.append("image", fileInput.files[0]);
        }
        fileInput.disabled = true;
        const q = await pb
            .collection("questions")
            .update(questions[ind].id, formData);
        fileInput.disabled = false;
        fileInput.value = "";
        questions[ind].image = q.image;
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

        if (e.key == "Tab" && ind == questions.length - 1) {
            e.preventDefault();
            newquestion();
        }
    }

    async function handleMultipleInput(e: KeyboardEvent) {
        let t = e.target as HTMLInputElement;
        if (e.key == "Enter") {
            questions[ind].kind = "multiple";
            questions[ind].answer.values.push("");
            questions[ind].answer = questions[ind].answer; // Make svelte happy
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
                questions[ind].answer = questions[ind].answer; // Make svelte happy
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

        if (
            e.key == "Tab" &&
            parseInt(t.id) == inputs.length - 1 &&
            ind == questions.length - 1
        ) {
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

    function blanksCheck(e: KeyboardEvent) {
        let t = e.target as HTMLInputElement;

        if (t.value == "include") {
            questions[ind].kind = "include";
            questions[ind].answer = {};
            edit();
        } else if (questions[ind].kind == "include") {
            questions[ind].kind = "single";
            questions[ind].answer = { value: "" };
            edit();
        }

        const blanksRe = /`(.+?)`/g;
        let matches = [...t.value.matchAll(blanksRe)];
        if (matches.length > 0) {
            if (questions[ind].kind != "blanks") {
                questions[ind].kind = "blanks";
                questions[ind].answer = { blanks: [] };
            }
            while (questions[ind].answer.blanks.length < matches.length) {
                questions[ind].answer.blanks.push({ key: "", value: "" });
            }
            while (questions[ind].answer.blanks.length > matches.length) {
                questions[ind].answer.blanks.pop();
            }

            for (let [i, match] of matches.entries()) {
                questions[ind].answer.blanks[i].key = match[1];
            }
            edit();
        } else if (questions[ind].kind == "blanks") {
            questions[ind].kind = "single";
            questions[ind].answer = { value: "" };
            edit();
        }
    }

    async function handleBlanksInput(e: KeyboardEvent) {
        let t = e.target as HTMLInputElement;

        if (
            e.key == "Tab" &&
            parseInt(t.id) == questions[ind].answer.blanks.length - 1 &&
            ind == questions.length - 1
        ) {
            e.preventDefault();
            newquestion();
        }
    }

    async function handleIncludeInput(e: KeyboardEvent) {
        if (e.key == "Tab" && ind == questions.length - 1) {
            e.preventDefault();
            newquestion();
        }
    }

    async function handleClipboardPaste(e: ClipboardEvent) {
        // Get it from clipboard
        const formData = new FormData();
        let hasImage = false;
        for (let f of e.clipboardData!.files) {
            if (f.type == "image/png" || f.type == "image/jpeg") {
                hasImage = true;
                formData.append("image", f);
                break;
            }
        }
        if (!hasImage) {
            return;
        }

        // Upload
        fileInput.disabled = true;
        const q = await pb
            .collection("questions")
            .update(questions[ind].id, formData);
        fileInput.disabled = false;
        fileInput.value = "";
        questions[ind].image = q.image;
    }
</script>

<div class="card mt-3">
    {#if questions[ind].image && browser}
        <img
            src={pb.getFileUrl(questions[ind], questions[ind].image)}
            class="card-img-top"
            alt="Question"
        />
    {/if}
    {#if owner}
        <div class="card-header">
            <input
                type="file"
                class="form-control"
                bind:this={fileInput}
                on:change={editImage}
                accept="image/png, image/jpeg"
            />
        </div>
    {/if}
    <div class="card-body">
        <div class="card-title input-group">
            <input
                class="form-control"
                bind:value={questions[ind].question}
                on:change={edit}
                bind:this={focus}
                on:keydown={handleTitleInput}
                on:paste={handleClipboardPaste}
                on:keyup={blanksCheck}
                placeholder="Question"
                disabled={!owner}
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
                disabled={!owner}
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
                    disabled={!owner}
                />
            {/each}
        {:else if questions[ind].kind == "blanks"}
            {#each questions[ind].answer.blanks as b, i}
                <div class="input-group">
                    <span class="input-group-text">{b.key}</span>
                    <input
                        class="form-control"
                        bind:value={questions[ind].answer.blanks[i].value}
                        on:change={edit}
                        id={i.toString()}
                        on:keydown={handleBlanksInput}
                        placeholder="Answer"
                        disabled={!owner}
                    />
                </div>
            {/each}
        {:else if questions[ind].kind == "include"}
            <input
                class="form-control"
                placeholder="Included set ID"
                on:change={edit}
                on:keydown={handleIncludeInput}
                bind:value={questions[ind].include}
                bind:this={inputs[0]}
                disabled={!owner}
            />
            {#if questions[ind].expand?.include}
                <div class="mt-3">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title mb-2">
                                {questions[ind].expand?.include.title}
                            </h6>
                            <h6 class="card-subtitle mb-2 text-body-secondary">
                                By {questions[ind].expand?.include.expand.author
                                    .username}
                            </h6>
                            <p class="card-text">
                                {questions[ind].expand?.include.questions
                                    .length} questions
                            </p>
                        </div>
                    </div>
                </div>
            {:else}
                Don't know how to include sets? Check out <a
                    target="_blank"
                    href="/help/include">the help page</a
                >.
            {/if}
        {/if}
    </div>
</div>
