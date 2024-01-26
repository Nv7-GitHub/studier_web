import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, locals }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        // Register
        try {
            await locals.pb?.collection("users").create({
                "username": username,
                "email": email,
                "password": password,
                "passwordConfirm": password,
            });
        } catch (err: any) {
            return fail(400, err.data.data);
        }

        // Login
        try {
            const usr = await locals.pb?.collection("users").authWithPassword(email, password);
            await locals.pb?.collection("folders").create({
                "parent": null,
                "name": "Home",
                "user": usr?.record.id,
            })
        } catch (err) {
            console.log('Login error', err);
        }

        throw redirect(303, "/");
    }
};

