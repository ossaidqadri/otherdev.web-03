<script lang="ts">
	import type { Snippet } from "svelte";
	import { Badge } from "@/lib/components/ui/badge";
	import { Button } from "@/lib/components/ui/button";
	import * as Collapsible from "@/lib/components/ui/collapsible";

	let { lead, tags, more, less, details }: { lead: string; tags: string[]; more?: string; less?: string; details?: Snippet } = $props();
	let open = $state(false);
</script>

<!-- The case study's summary on the left and the full write-up on the right. The write-up stays mounted and its height
     eases open (grid rows 0fr to 1fr), so the left column keeps its width while it is closed. -->
<Collapsible.Root bind:open class="flex w-full flex-col md:flex-row">
	<div class="flex flex-1 flex-col items-start gap-8 md:sticky md:top-[var(--container-navpadding)] md:self-start md:pr-[var(--card-padding)]">
		{#if tags.length > 0}
			<div class="flex flex-wrap items-center gap-1">
				{#each tags as t (t)}
					<Badge variant="tag" class="type-body-button-s">{t}</Badge>
				{/each}
			</div>
		{/if}
		<div class="type-heading-s flex max-w-[40rem] flex-col gap-1">
			<p>{lead}</p>
			<Collapsible.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="plain" size="bare" class="w-fit cursor-pointer text-left whitespace-normal opacity-40 transition-opacity duration-300 hover:opacity-60 focus-visible:opacity-60">
						{open ? less : more}
					</Button>
				{/snippet}
			</Collapsible.Trigger>
		</div>
	</div>
	<Collapsible.Content
		forceMount
		class="grid min-w-0 grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100 md:flex-1"
	>
		<div class="min-h-0 overflow-hidden">
			<div class="flex w-full max-w-[40rem] flex-col gap-14 max-md:pt-[var(--section-padding-sm)]">
				{@render details?.()}
			</div>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
