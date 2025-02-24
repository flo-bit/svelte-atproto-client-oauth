import { base } from '$app/paths';
import { URL } from './auth.svelte';

export const metadata = {
	client_id: `${URL}${base}/client-metadata.json`,

	redirect_uris: [URL + base],

	scope: 'atproto transition:generic',
	grant_types: ['authorization_code', 'refresh_token'],
	response_types: ['code'],
	token_endpoint_auth_method: 'none',
	application_type: 'web',
	dpop_bound_access_tokens: true
};
