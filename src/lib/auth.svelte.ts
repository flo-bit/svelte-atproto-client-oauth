import type { BrowserOAuthClient } from '@atproto/oauth-client-browser';

export const HANDLE_RESOLVER_URL = 'https://bsky.social';
export const PLC_DIRECTORY_URL = undefined;

export const BASE_PATH = '/svelte-atproto-client-oauth';

export const data = $state({
	agent: null as OAuthUserAgent | null,
	session: null as Session | null,
	client: null as BrowserOAuthClient | null,
	isInitializing: true
});

import {
	configureOAuth,
	createAuthorizationUrl,
	finalizeAuthorization,
	resolveFromIdentity,
	type Session,
	OAuthUserAgent,
	getSession
} from '@atcute/oauth-browser-client';

export async function initOAuthClient() {
	data.isInitializing = true;

	const clientId = `${window.location.origin}/svelte-atproto-client-oauth/client-metadata.json`;

	configureOAuth({
		metadata: {
			client_id: clientId,
			redirect_uri: `${window.location.origin}/svelte-atproto-client-oauth`
		}
	});

	const params = new URLSearchParams(location.hash.slice(1));

	const did = localStorage.getItem('last-login');

	if (params.size > 0) {
		history.replaceState(null, '', location.pathname + location.search);

		// you'd be given a session object that you can then pass to OAuthUserAgent!
		const session = await finalizeAuthorization(params);

		data.session = session;
		console.log(session);

		data.agent = new OAuthUserAgent(session);

		// save did to local storage
		localStorage.setItem('last-login', session.info.sub);
	} else if (did) {
		try {
			const session = await getSession(did as `did:${string}`, { allowStale: true });
			data.session = session;

			data.agent = new OAuthUserAgent(session);

			console.log('resuming session', session);
		} catch (error) {
			console.error('error resuming session', error);
		}
	}

	data.isInitializing = false;
}

export async function trySignIn(value: string) {
	if (value.startsWith('did:')) {
		if (value.length > 5) await signIn(value);
		else throw new Error('DID must be at least 6 characters');
	} else if (value.includes('.') && value.length > 3) {
		const handle = value.startsWith('@') ? value.slice(1) : value;
		if (handle.length > 3) await signIn(handle);
		else throw new Error('Handle must be at least 4 characters');
	} else if (value.length > 3) {
		const handle = (value.startsWith('@') ? value.slice(1) : value) + '.bsky.social';
		await signIn(handle);
	} else {
		throw new Error('Please provide a valid handle, DID, or PDS URL');
	}
}

export async function signIn(input: string) {
	const { identity, metadata } = await resolveFromIdentity(input);

	const authUrl = await createAuthorizationUrl({
		metadata: metadata,
		identity: identity,
		scope: 'atproto transition:generic'
	});

	// recommended to wait for the browser to persist local storage before proceeding
	await new Promise((resolve) => setTimeout(resolve, 200));

	// redirect the user to sign in and authorize the app
	window.location.assign(authUrl);

	await new Promise((_resolve, reject) => {
		const listener = () => {
			reject(new Error(`user aborted the login request`));
		};

		window.addEventListener('pageshow', listener, { once: true });
	});
}

export async function signOut() {
	const currentAgent = data.agent;
	if (currentAgent) {
		await currentAgent.signOut();
		data.session = null;
		data.agent = null;

		localStorage.removeItem('last-login');
	}
}
