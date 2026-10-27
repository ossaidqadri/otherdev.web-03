<script lang="ts">
	import * as Sheet from "$lib/components/ui/sheet/index.js";

	type Link = { label: string; href: string };

	let {
		name,
		nav,
		cta,
		labels,
	}: { name: string; nav: Link[]; cta: Link; labels: { open?: string; close?: string; title?: string } } = $props();

	let open = $state(false);
	const close = () => (open = false);
</script>

<!-- Phone-only full-screen menu; the island hydrates only below md (Header.astro). -->
<Sheet.Root bind:open>
	<Sheet.Trigger aria-label={labels.open} class="md:hidden">
		<svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M0 1h22M0 11h22" /></svg>
	</Sheet.Trigger>
	<Sheet.Content
		side="top"
		showCloseButton={false}
		data-lenis-prevent
		class="type-heading-m h-dvh border-0 bg-[linear-gradient(to_bottom,var(--global-winter-300),var(--global-winter-100)_60%,#fff)] text-[color:var(--global-neutral-900)] shadow-none"
	>
		<Sheet.Title class="sr-only">{labels.title}</Sheet.Title>
		<div class="flex items-center justify-between px-[var(--container-padding)] py-6 md:py-8">
			<a href="/" class="wordmark" aria-label={`${name} home`} onclick={close}>{name}</a>
			<div class="type-body-button-m flex items-center gap-7">
				<a href={cta.href} onclick={close}>{cta.label}</a>
				<Sheet.Close aria-label={labels.close}>
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 1l16 16M17 1L1 17" /></svg>
				</Sheet.Close>
			</div>
		</div>
		<ul class="flex flex-1 flex-col items-center justify-center gap-5 pb-24">
			{#each nav as l (l.href)}
				<li><a href={l.href} onclick={close}>{l.label}</a></li>
			{/each}
		</ul>
	</Sheet.Content>
</Sheet.Root>
