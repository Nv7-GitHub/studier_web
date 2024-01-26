export async function load({ locals, params }) {
    return {
        folder: await locals.pb?.collection("folders").getOne(params.folder),
        subfolders: await locals.pb?.collection("folders").getFullList({
            filter: `parent.id="${params.folder}" && user.id="${locals.user?.id}"`,
        })!,
        sets: await locals.pb?.collection("sets").getFullList({
            filter: `folder.id="${params.folder}" && author.id="${locals.user?.id}"`,
        })!,
    }
};

export const actions = {
    newfolder: async ({ locals, params, request }) => {
        console.log("NEW FOLDER");
        console.log(request)
        const data = await request.formData();
        console.log("FORM DATA:");
        console.log(data);
        const name = data.get("foldername") as string;
        await locals.pb?.collection("folders").create({
            name,
            parent: params.folder,
            user: locals.user?.id,
        })
        return { success: true };
    },
    delfolder: async ({ locals, params }) => {
        //await locals.pb?.collection("folders").delete(params.folder); // This deletes the parent folder
        console.log("DEL FOLDER")
        return { success: true };
    }
}