import { type RecordModel } from "pocketbase";

export async function load({ locals, params }) {
    let progress: RecordModel | null = null;
    if (locals.user) {
        try {
            progress = await locals.pb?.collection("progress").getFirstListItem(`user.id = "${locals.user.id}" && set.id = "${params.set}"`)!;
        } catch (e) {
            progress = await locals.pb?.collection("progress").create({
                user: locals.user.id,
                set: params.set,
            })!;
        }
    }
    return {
        set: await locals.pb?.collection("sets").getOne(params.set, {
            expand: "questions,folder",
        }),
        progress,
    }
};