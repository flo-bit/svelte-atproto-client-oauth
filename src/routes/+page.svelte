<script lang="ts">
	import { client, logout, Button, loginModalState } from '$lib/oauth';

	let likes: {
		post: {
			record: {
				text: string;
			};
		};
	}[] = $state([]);

	async function getLikes() {
		if (!client.profile?.did || !client.rpc) return;

		// example of how to get some data for a logged in user
		const response = await client.rpc.request({
			type: 'get',
			nsid: 'app.bsky.feed.getActorLikes',
			params: {
				actor: client.profile.did,
				limit: 10
			}
		});

		likes = response?.data.feed;
	}
</script>

<div class="mx-auto my-4 max-w-3xl px-4 md:my-32">
	<h1 class="text-3xl font-bold">svelte atproto client oauth demo</h1>

	<a href="https://github.com/flo-bit/svelte-atproto-client-oauth" target="_blank" class="text-sm text-rose-600 mt-2">source code</a>

	{#if client.isInitializing}
		<div class="mt-8 text-sm">loading...</div>
	{/if}

	{#if !client.isInitializing && !client.agent}
		<div class="mt-8 text-sm">not signed in</div>
		<Button class="mt-4" onclick={() => loginModalState.show()}>Sign In</Button>
	{/if}

	{#if client.isLoggedIn}
		<div class="mt-8 text-sm">signed in as</div>

		<div class="mt-2 flex gap-1 font-semibold">
			<img
				src={client.profile?.avatar}
				class="h-6 w-6 rounded-full"
				alt="avatar of {client.profile?.handle}"
			/>
			<span>{client.profile?.handle}</span>
		</div>

		<Button class="mt-4" onclick={() => logout()}>Sign Out</Button>

		<Button class="mt-4" onclick={getLikes}>Get recent likes</Button>

		{#if likes.length > 0}
			<div class="mt-8 text-sm">recent likes</div>
			<ul class="mt-4 flex flex-col gap-2 text-sm">
				{#each likes as like}
					<li>{like.post.record.text}</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>
