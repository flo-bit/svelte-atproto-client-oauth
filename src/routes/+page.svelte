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
		if (data.agent?.did) {
			const likesData = await data.agent.getActorLikes({ actor: data.agent.did, limit: 10 });
			console.log(likesData);
			likes = likesData.data.feed;
		}
	}
</script>

<div class="mx-auto my-16 max-w-3xl px-2">
	<h1 class="text-3xl font-bold">svelte atproto client oauth demo</h1>

	{#if !data.client}
		<div class="mt-8 text-sm">client not loaded</div>
	{/if}

	{#if data.client && !data.agent}
		<div class="mt-8 text-sm">not signed in</div>
		<Button class="mt-4" onclick={() => (showLoginModal.visible = true)}>Sign In</Button>
	{/if}

	{#if data.agent}
		<div class="mt-8 text-sm">signed in with {data.agent.did}</div>

		<Button class="mt-4" onclick={() => signOut()}>Sign Out</Button>

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
