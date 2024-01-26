import { redirect } from '@sveltejs/kit';

export async function GET({ locals }) {
    // Clear the authStore
    locals.pb?.authStore.clear();

    // Set the user to undefined
    locals.user = undefined;

    // Redirect to the home page
    throw redirect(303, '/');
};