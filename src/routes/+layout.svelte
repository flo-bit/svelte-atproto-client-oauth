<script lang="ts">
	import '../app.css';
	
	import { onMount } from 'svelte';
	import { initOAuthClient } from '$lib/auth.svelte';
	import LoginModal from '$lib/UI/LoginModal.svelte';
	let { children } = $props();

	onMount(() => {
		initOAuthClient();
	});
</script>

{@render children()}

<LoginModal />
