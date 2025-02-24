const url = 'https://flo-bit.dev/svelte-atproto-client-oauth';

export const metadata = {
	client_id: `${url}/client-metadata.json`,

	client_name: 'Svelte Atproto Client OAuth',

	redirect_uris: [url],

	scope: 'atproto',
	grant_types: ['authorization_code', 'refresh_token'],
	response_types: ['code'],
	token_endpoint_auth_method: 'none',
	application_type: 'web',
	dpop_bound_access_tokens: true
};
