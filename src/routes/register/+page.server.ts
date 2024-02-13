import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, locals }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        // Register
        let usrid: string;
        try {
            const usr = await locals.pb?.collection("users").create({
                "username": username,
                "email": email,
                "password": password,
                "passwordConfirm": password,
            });
            usrid = usr?.id!;
        } catch (err: any) {
            return fail(400, err.data.data);
        }

        // Login
        try {
            await locals.pb?.collection("users").authWithPassword(email, password);
            const home = await locals.pb?.collection("folders").create({
                "parent": null,
                "name": "Home",
                "user": usrid,
            })
            await locals.pb?.collection("users").update(usrid, {
                "home": home?.id,
            });
        } catch (err) {
            console.log('Login error', err);
        }

        throw redirect(303, "/");
    }
};

