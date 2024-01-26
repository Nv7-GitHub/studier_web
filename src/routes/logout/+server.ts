import { redirect } from '@sveltejs/kit';

export async function GET({ locals }) {
    console.log("GET");

    // Clear the authStore
    locals.pb?.authStore.clear();

    // Set the user to undefined
    locals.user = undefined;

    console.log("Logged out");

    // Redirect to the home page
    throw redirect(303, '/');
};