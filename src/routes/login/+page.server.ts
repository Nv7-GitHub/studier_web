import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, locals }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        // Login
        try {
            await locals.pb?.collection("users").authWithPassword(username, password);
        } catch (err: any) {
            return fail(400, err.data);
        }

        throw redirect(303, "/");
    }
};

