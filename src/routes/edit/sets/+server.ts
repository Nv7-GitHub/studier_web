import { redirect } from '@sveltejs/kit';

export async function GET({ locals }) {
    let root = await locals.pb?.collection("folders").getFirstListItem(`parent:length=0 && user.id="${locals.user?.id}"`);

    // Redirect to the home page
    throw redirect(303, '/edit/sets/' + root?.id);
};