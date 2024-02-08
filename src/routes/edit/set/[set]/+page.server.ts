export async function load({ locals, params }) {
    return {
        set: await locals.pb?.collection("sets").getOne(params.set, {
            expand: "questions",
        }),
    }
};