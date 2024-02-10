export async function load({ locals, params }) {
    return {
        folder: await locals.pb?.collection("folders").getOne(params.folder, {
            expand: "parent,user",
        }),
        subfolders: await locals.pb?.collection("folders").getFullList({
            filter: `parent.id="${params.folder}"`,
            sort: "name"
        })!,
        sets: await locals.pb?.collection("sets").getFullList({
            filter: `folder.id="${params.folder}"`,
            sort: "title"
        })!,
    }
};

export const actions = {
    newfolder: async ({ locals, params, request, route }) => {
        const data = await request.formData();
        const name = data.get("name") as string;
        await locals.pb?.collection("folders").create({
            name,
            parent: params.folder,
            user: locals.user?.id,
        })
        return { success: true };
    },
    newset: async ({ locals, params, request, route }) => {
        const data = await request.formData();
        const name = data.get("name") as string;
        const set = await locals.pb?.collection("sets").create({
            title: name,
            folder: params.folder,
            author: locals.user?.id,
            questions: [],
        })
        const q = await locals.pb?.collection("questions").create({
            set: set?.id,
            question: "",
            kind: "single",
            answer: { "value": "" },
        });
        await locals.pb?.collection("sets").update(set!.id, {
            questions: [q?.id],
        });
        return { success: true };
    },
    delfolder: async ({ locals, request }) => {
        const data = await request.formData();
        const id = data.get('id') as string;
        await locals.pb?.collection("folders").delete(id);
        return { success: true };
    },
    delset: async ({ locals, request }) => {
        const data = await request.formData();
        const id = data.get('id') as string;
        await locals.pb?.collection("sets").delete(id);
        return { success: true };
    }
}