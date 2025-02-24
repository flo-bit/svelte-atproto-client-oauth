<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { data, initOAuthClient } from '$lib/auth.svelte';
	import LoginModal from '$lib/UI/LoginModal.svelte';
	let { children } = $props();

	onMount(() => {
		initOAuthClient();
	});

	// $effect(async () => {
	// 	if (data.agent) {
	// 		const likes = await data.agent.getActorLikes({ actor: data.agent.did });
	// 		console.log(likes);
	// 	}
	// });

	$inspect(data.agent);
</script>

{@render children()}

<LoginModal />
