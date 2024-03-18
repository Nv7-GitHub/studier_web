import type { RecordModel } from 'pocketbase';

export async function load({ locals, params }) {
    const res = await locals.pb?.collection("progress").getFullList({
        filter: `user.id="${locals.user?.id}"`,
        sort: "-updated",
        expand: "set"
    })
    return {
        progress: res as RecordModel[],
    }
};

export const actions = {
    del: async ({ locals, request }) => {
        const data = await request.formData();
        const id = data.get('id') as string;
        await locals.pb?.collection("progress").delete(id);
        return { success: true };
    }
}