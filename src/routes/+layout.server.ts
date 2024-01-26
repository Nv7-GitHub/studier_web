import type { LayoutServerLoad } from './$types';

// Define the output type
export type OutputType = { user: object; isLoggedIn: boolean };

// Define the load function
export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user,
    };
};