import { POCKETBASE_URL } from '$lib';
import { redirect, type Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
    // Create a new PocketBase instance
    event.locals.pb = new PocketBase(POCKETBASE_URL);

    // Load the authStore from the cookie
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    try {
        // Check if the user is authenticated
        if (event.locals.pb.authStore.isValid) {
            // Refresh the user's authentication
            await event.locals.pb.collection('users').authRefresh();

            // Set the user in the locals object
            event.locals.user = structuredClone(event.locals.pb.authStore.model);
        }
    } catch (err) {
        // Clear the authStore if there is an error
        event.locals.pb.authStore.clear();
    }

    // Check if the user isn't logged in every request to '/login'
    if (event.url.pathname.startsWith('/login') || event.url.pathname.startsWith('/register')) {
        if (event.locals.user) {
            // Redirect to the home page if the user is logged in
            throw redirect(303, '/');
        }
    }
    if (event.url.pathname.startsWith('/progress')) {
        if (!event.locals.user) {
            // Redirect to the home page if the user isn't logged in
            throw redirect(303, '/');
        }
    }

    // Resolve the request
    const response = await resolve(event);

    // Set the cookie
    const isProd = process.env.NODE_ENV === 'production' ? true : false;
    response.headers.set(
        'set-cookie',
        event.locals.pb.authStore.exportToCookie({ secure: isProd, sameSite: 'Lax', httpOnly: false })
    );

    return response;
};