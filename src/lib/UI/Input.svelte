<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = HTMLInputAttributes & {
		value?: string;
	};

	let { value = $bindable(), ...props }: Props = $props();
</script>

<input
	bind:value
	class="block w-full rounded-full border-0 py-1.5 text-neutral-900 shadow-sm ring-1 ring-neutral-300 ring-inset placeholder:text-neutral-400 focus:ring-2 focus:ring-rose-600 focus:ring-inset sm:text-sm/6 dark:bg-neutral-950 dark:text-neutral-100 dark:ring-neutral-700 dark:placeholder:text-neutral-600"
	{...props}
/>
