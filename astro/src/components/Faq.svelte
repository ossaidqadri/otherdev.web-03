<script lang="ts">
	import * as Accordion from "@/lib/components/ui/accordion";
	import { Separator } from "@/lib/components/ui/separator";

	let { items }: { items: { q: string; a: string }[] } = $props();
</script>

<!-- Each answer opens in place: the row's dot grows in and the panel's height eases open, as on the reference.
     The trigger keeps its 32px padding closed and open; the panel is pulled up 24px and the item adds the 24px back,
     so only the answer's own height animates. -->
<Accordion.Root type="single" class="overflow-visible rounded-none border-0">
	<Separator />
	{#each items as item, i (item.q)}
		<Accordion.Item value={String(i)} class="w-full border-0 pb-6 not-last:border-b-0 data-open:bg-transparent">
			<Accordion.Trigger
				class="group w-full cursor-pointer items-center justify-start gap-0 border-0 p-0 py-8 text-base font-normal transition-none hover:no-underline focus-visible:[outline-style:auto] **:data-[slot=accordion-trigger-icon]:hidden!"
			>
				<span aria-hidden="true" class="w-0 shrink-0 transition-all duration-200 group-hover:w-6 group-aria-expanded:w-6">
					<span class="block size-4 origin-center scale-0 rounded-full bg-[var(--semantic-text-primary)] opacity-0 transition duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-aria-expanded:scale-100 group-aria-expanded:opacity-100"></span>
				</span>
				<span class="type-heading-s text-[var(--semantic-text-primary)]">{item.q}</span>
			</Accordion.Trigger>
			<Accordion.Content hiddenUntilFound wrapperClass="-mt-6 px-0 text-base duration-300" class="pb-2">
				<p class="type-heading-s text-[var(--semantic-text-primary)] opacity-40">{item.a}</p>
			</Accordion.Content>
		</Accordion.Item>
		<Separator />
	{/each}
</Accordion.Root>
