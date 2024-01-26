// See https://kit.svelte.dev/docs/types#app

import type { AuthModel } from 'pocketbase';

// for information about these interfaces
declare global {
	namespace App {
		type PocketBase = import('pocketbase').default;

		interface Locals {
			pb?: PocketBase;
			user?: AuthModel;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
