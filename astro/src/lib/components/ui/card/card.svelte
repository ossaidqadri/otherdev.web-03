<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const cardVariants = tv({
		base: "group/card flex flex-col overflow-hidden",
		variants: {
			variant: {
				default: "bg-card text-card-foreground ring-foreground/5 dark:ring-foreground/10 gap-(--card-spacing) rounded-4xl py-(--card-spacing) text-sm shadow-md ring-1 [--card-spacing:--spacing(6)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] *:[img:first-child]:rounded-t-4xl *:[img:last-child]:rounded-b-4xl",
				// Site tile: flat, rounded, clips its media; colour comes from the caller or the media.
				tile: "relative rounded-lg",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type CardVariant = VariantProps<typeof cardVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = "default",
		variant = "default",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & { size?: "default" | "sm"; variant?: CardVariant } = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	data-size={size}
	class={cn(cardVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</div>
