# svelte atproto client oauth demo

this is a scaffold for how to get client side oauth working with sveltekit and atproto 
using the `@atcute/oauth-browser-client` library.

perfect for static builds e.g. using github pages.

## how to install

### either clone this repo

1. clone this repo
2. run `npm install`
3. run `npm run dev`
4. go to `http://127.0.0.1:5179`
5. for deployment change the `SITE_URL` variable in `src/lib/oauth/const.ts` 
(e.g. for github pages: `https://your-username.github.io`) and set your base in `svelte.config.js` 
(e.g. for github pages: `base: '/your-repo-name/'`)


### or manually install in your own project

- copy the `src/lib/oauth` folder into your own project
- also copy the `src/routes/client-metadata.json` folder into your project
- add the following to your `src/routes/+layout.svelte`

```svelte
<script>
	import { initClient } from '$lib/oauth';

	onMount(() => {
		initClient();
	});
</script>

{@render children()}
```

## how to use

### login flow

Either use the `LoginModal` component to render a login modal or use the `client` object to handle the login flow yourself.

```ts
// handlin login flow yourself
import { client } from '$lib/oauth';

// methods:
client.login(handle); // login the user
client.isLoggedIn; // check if the user is logged in
client.logout(); // logout the user
```

LoginModal is a component that renders a login modal, add it for a quick login flow.

```svelte
<script>
	import { LoginModal, loginModalState } from '$lib/oauth';
</script>

<LoginModal />

<button onclick={() => loginModalState.show()}>Show Login Modal</button>
```

### make requests

Get the user's profile and make requests with the `client.rpc` object.

```ts
import { client } from '$lib/oauth';

// get the user's profile
const profile = client.profile;

// make requests with the client.rpc object
const response = await client.rpc.request({
	type: 'get',
	nsid: 'app.bsky.feed.getActorLikes',
	params: {
		actor: client.profile?.did,
		limit: 10
	}
});
```
