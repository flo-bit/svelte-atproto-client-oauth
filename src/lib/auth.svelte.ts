import {
	configureOAuth,
	createAuthorizationUrl,
	finalizeAuthorization,
	resolveFromIdentity,
	type Session,
	OAuthUserAgent,
	getSession
} from '@atcute/oauth-browser-client';
import { dev } from '$app/environment';
import { XRPC } from '@atcute/client';
import { base } from '$app/paths';

export const URL = 'https://flo-bit.dev';

export const data = $state({
	agent: null as OAuthUserAgent | null,
	session: null as Session | null,
	rpc: null as XRPC | null,
	profile: null as {
		handle: string;
		did: string;
		createdAt: string;
		description?: string;
		displayName?: string;
		banner?: string;
		avatar?: string;
		followersCount?: number;
		followsCount?: number;
		postsCount?: number;
	} | null,
	isInitializing: true
});

export async function initOAuthClient() {
	data.isInitializing = true;

	const clientId = dev
		? `http://localhost` +
			`?redirect_uri=${encodeURIComponent('http://127.0.0.1:5179')}` +
			`&scope=${encodeURIComponent('atproto transition:generic')}`
		: `${URL}${base}/client-metadata.json`;

	configureOAuth({
		metadata: {
			client_id: clientId,
			redirect_uri: `${dev ? 'http://127.0.0.1:5179' : URL + base}`
		}
	});

	const params = new URLSearchParams(location.hash.slice(1));

	const did = localStorage.getItem('last-login') ?? undefined;

	if (params.size > 0) {
		await finalizeLogin(params, did);
	} else if (did) {
		await resumeSession(did);
	}

	data.isInitializing = false;
}

async function finalizeLogin(params: URLSearchParams, did?: string) {
	try {
		history.replaceState(null, '', location.pathname + location.search);

		const session = await finalizeAuthorization(params);
		data.session = session;

		setAgentAndXRPC(session);

		await loadProfile(session.info.sub);
		localStorage.setItem('last-login', session.info.sub);
	} catch (error) {
		console.error('error finalizing login', error);
		if (did) {
			await resumeSession(did);
		}
	}
}

async function resumeSession(did: string) {
	try {
		const session = await getSession(did as `did:${string}`, { allowStale: true });
		data.session = session;

		setAgentAndXRPC(session);

		await loadProfile(session.info.sub);
	} catch (error) {
		console.error('error resuming session', error);
	}
}

function setAgentAndXRPC(session: Session) {
	data.agent = new OAuthUserAgent(session);

	data.rpc = new XRPC({ handler: data.agent });
}

async function loadProfile(actor: string) {
	// check if profile is already loaded in local storage
	const profile = localStorage.getItem(`profile-${actor}`);
	if (profile) {
		console.log('loading profile from local storage');
		data.profile = JSON.parse(profile);
		return;
	}

	console.log('loading profile from server');
	const response = await data.rpc?.request({
		type: 'get',
		nsid: 'app.bsky.actor.getProfile',
		params: { actor }
	});

	if (response) {
		data.profile = response.data;
		localStorage.setItem(`profile-${actor}`, JSON.stringify(response.data));
	}
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

	await new Promise((resolve) => setTimeout(resolve, 200));

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
		const did = currentAgent.session.info.sub;

		localStorage.removeItem('last-login');
		localStorage.removeItem(`profile-${did}`);

		await currentAgent.signOut();
		data.session = null;
		data.agent = null;
		data.profile = null;
	} else {
		throw new Error('Not signed in');
	}
}
