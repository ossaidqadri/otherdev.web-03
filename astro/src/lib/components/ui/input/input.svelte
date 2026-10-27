<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const inputVariants = tv({
		base: "focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 transition-[color,box-shadow,background-color] file:h-7 file:text-sm file:font-medium focus-visible:ring-3 aria-invalid:ring-3 w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed",
		variants: {
			variant: {
				default: "bg-input/50 border-transparent h-9 rounded-3xl border px-3 py-1 text-base md:text-sm disabled:opacity-50",
				// Site field: borderless card fill, the type-* class sets the text.
				soft: "bg-card rounded-md px-4 py-3 disabled:opacity-60",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type InputVariant = VariantProps<typeof inputVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	> & { variant?: InputVariant };

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		variant = "default",
		"data-slot": dataSlot = "input",
		...restProps
	}: Props = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(inputVariants({ variant }), className)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(inputVariants({ variant }), className)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
