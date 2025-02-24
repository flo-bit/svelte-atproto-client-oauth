<script lang="ts">
	import { data, signOut } from '$lib/auth.svelte';
	import Button from '$lib/UI/Button.svelte';
	import { showLoginModal } from '$lib/state.svelte';

	let likes: {
		post: {
			record: {
				text: string;
			};
		};
	}[] = $state([]);

	async function getLikes() {
		if (!data.profile?.did) return;

		const response = await data.rpc?.request({
			type: 'get',
			nsid: 'app.bsky.feed.getActorLikes',
			params: {
				actor: data.profile.did,
				limit: 10
			}
		});

		likes = response?.data.feed;
	}

	async function putRecord() {
		if (!data.agent?.session.info.sub) return;

		try {
			const hello = await data.rpc?.call('com.atproto.repo.createRecord', {
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
</script>

<div class="mx-auto my-8 max-w-3xl px-2 md:my-32">
	<h1 class="text-3xl font-bold">svelte atproto client oauth demo</h1>

	{#if data.isInitializing}
		<div class="mt-8 text-sm">loading...</div>
	{/if}

	{#if !data.isInitializing && !data.agent}
		<div class="mt-8 text-sm">not signed in</div>
		<Button class="mt-4" onclick={() => (showLoginModal.visible = true)}>Sign In</Button>
	{/if}

	{#if data.agent}
		<div class="mt-8 text-sm">signed in as</div>

		<div class="mt-2 flex gap-1 font-semibold">
			<img
				src={data.profile?.avatar}
				class="h-6 w-6 rounded-full"
				alt="avatar of {data.profile?.handle}"
			/>
			<span>{data.profile?.handle}</span>
		</div>

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
