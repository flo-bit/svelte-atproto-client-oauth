<script>
	import { data, signOut } from '$lib/auth.svelte';
	import Button from '$lib/UI/Button.svelte';
	import { showLoginModal } from '$lib/state.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		console.log(data.agent);
	});

	let likes = $state([]);

	async function getLikes() {
		if (data.agent?.session.info.sub) {
			const response = await data.agent.handle(
				'/xrpc/app.bsky.feed.getActorLikes?actor=' + data.agent.session.info.sub + '&limit=10'
			);

			const json = await response.json();
			console.log(json);
			likes = json.feed;
		}
	}

	import { XRPC } from '@atcute/client';

	async function putRecord() {
		if (data.agent?.session.info.sub) {
			try {

				const rpc = new XRPC({ handler: data.agent });

				const hello = await rpc.call('com.atproto.repo.createRecord', {
					data: {
						collection: 'com.atproto.test',
						repo: data.agent.session.info.sub,
						record: {
							text: 'hello there'
						}
					}
				});
				console.log(hello);
			} catch (error) {
				console.log('hello', error);
			}
		}
	}
</script>

<div class="mx-auto my-16 max-w-3xl px-2">
	<h1 class="text-3xl font-bold">svelte atproto client oauth demo</h1>

	{#if data.isInitializing}
		<div class="mt-8 text-sm">loading...</div>
	{/if}

	{#if !data.isInitializing && !data.agent}
		<div class="mt-8 text-sm">not signed in</div>
		<Button class="mt-4" onclick={() => (showLoginModal.visible = true)}>Sign In</Button>
	{/if}

	{#if data.agent}
		<div class="mt-8 text-sm">signed in with {data.agent.session.info.sub}</div>

		<Button class="mt-4" onclick={() => signOut()}>Sign Out</Button>

		<Button class="mt-4" onclick={getLikes}>Get recent likes</Button>

		<Button class="mt-4" onclick={putRecord}>Put record</Button>

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
