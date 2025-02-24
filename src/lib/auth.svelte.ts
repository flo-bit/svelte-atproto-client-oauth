import type { BrowserOAuthClient, OAuthSession } from '@atproto/oauth-client-browser';
import type { Agent } from '@atproto/api';

const { MODE } = import.meta.env;

export const HANDLE_RESOLVER_URL = 'https://bsky.social';
export const PLC_DIRECTORY_URL = undefined;

export const BASE_PATH = '/svelte-atproto-client-oauth';

export const data = $state({
	agent: null as Agent | null,
	session: null as OAuthSession | null,
	client: null as BrowserOAuthClient | null,
	isInitializing: true
});

let oauthClient: BrowserOAuthClient | null = null;

export async function initOAuthClient() {
	// Dynamically import the module on the client side
	const { BrowserOAuthClient } = await import('@atproto/oauth-client-browser');
	const { Agent } = await import('@atproto/api');

	const clientId = `http://localhost?${new URLSearchParams({
		scope: 'atproto transition:generic',
		redirect_uri: Object.assign(new URL(window.location.origin), {
			hostname: '[::1]'
		}).href
	})}`;

	oauthClient = await BrowserOAuthClient.load({
		clientId,
		handleResolver: HANDLE_RESOLVER_URL,
		plcDirectoryUrl: PLC_DIRECTORY_URL,
		allowHttp: MODE === 'development' || MODE === 'test'
	});

	data.client = oauthClient;

	try {
		const initResult = await oauthClient.init();
		if (initResult) {
			data.session = initResult.session;
			data.agent = new Agent(initResult.session);
		}
	} catch (err) {
		console.error('Failed to initialize OAuth client:', err);
	} finally {
		data.isInitializing = false;
	}
}

export async function trySignIn(value: string) {
	if (value.startsWith('did:')) {
		if (value.length > 5) await signIn(value);
		else throw new Error('DID must be at least 6 characters');
	} else if (value.startsWith('https://') || value.startsWith('http://')) {
		const url = new URL(value);
		if (value !== url.origin) throw new Error('PDS URL must be an origin');
		await signIn(value);
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
	if (!oauthClient) throw new Error('OAuth client not initialized');

	try {
		const userSession = await oauthClient.signIn(input);
		data.session = userSession;

		const { Agent } = await import('@atproto/api');
		data.agent = new Agent(userSession);
	} catch (err) {
		console.error('Sign-in error:', err);
		throw err;
	}
}

export async function signOut() {
	const currentSession = data.session;
	if (currentSession) {
		await currentSession.signOut();
		data.session = null;
		data.agent = null;
	}
}
