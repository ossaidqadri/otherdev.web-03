<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		wrapperClass,
		children,
		...restProps
	}: WithoutChild<AccordionPrimitive.ContentProps> & {
		/** Classes for the animated outer element; `class` styles the inner one. */
		wrapperClass?: string;
	} = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	data-slot="accordion-content"
	class={cn("data-open:animate-accordion-down data-closed:animate-accordion-up px-4 text-sm overflow-hidden", wrapperClass)}
	{...restProps}
>
	<div
		class={cn(
			"pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
			className
		)}
	>
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
