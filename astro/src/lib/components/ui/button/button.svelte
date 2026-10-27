<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	// shadcn's own look (1px border, text-sm, press nudge). Kept off `base` so the site variants
	// below, which take their type from the type-* classes, render at the exact design size.
	const stock = "rounded-4xl border border-transparent bg-clip-padding text-sm font-medium active:not-aria-[haspopup]:translate-y-px";

	export const buttonVariants = tv({
		base: "focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default: `${stock} bg-primary text-primary-foreground hover:bg-primary/80`,
				outline: `${stock} border-border bg-background dark:bg-transparent hover:bg-muted hover:text-foreground dark:hover:bg-input/30 aria-expanded:bg-muted aria-expanded:text-foreground`,
				secondary: `${stock} bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground`,
				ghost: `${stock} hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground`,
				destructive: `${stock} bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30`,
				link: `${stock} text-primary underline-offset-4 hover:underline`,
				// Site variants. glass: the pill over scene skies; a scene restyles it by setting
				// --pill-bg, --pill-fg and --pill-fade (colour transition) on an ancestor.
				glass: "bg-[var(--pill-bg,rgb(255_255_255/0.16))] text-[color:var(--pill-fg,#fff)] transition-[color,background-color] duration-[var(--pill-fade,0ms)] ease-in-out",
				card: "bg-card text-card-foreground",
				// Text link with a 7.5% wash of its own colour fading in behind it on hover.
				nav: "rounded-sm hover:bg-current/7.5 hover:backdrop-blur-[32px] focus-visible:bg-current/7.5 transition-[background-color,backdrop-filter] duration-300 ease-in-out",
				// Floating section nav: dim until hovered or marked current by the scroll spy (motion.ts).
				spy: "rounded-full text-(--fg) opacity-40 hover:opacity-100 [&[aria-current]]:opacity-100 transition-opacity duration-300 ease-in-out",
				// Filter/view toggles driven by aria-pressed (scripts/work-filter.ts flips it).
				toggle: "rounded-sm opacity-40 not-aria-pressed:hover:opacity-70 aria-pressed:bg-(--semantic-transparent-weak) aria-pressed:opacity-100 transition-[opacity,background-color] duration-200 ease-out",
			},
			size: {
				default: "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
				xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
				icon: "size-9",
				"icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
				// Site sizes: no border, so the box is exactly padding plus the type's line box.
				pill: "h-auto gap-2 rounded-full border-0 px-6 py-4",
				"pill-sm": "h-auto gap-2 rounded-full border-0 px-5 py-3",
				nav: "h-auto gap-1 px-2.5 py-1.5",
				spy: "h-10 px-4",
				"icon-nav": "size-8 rounded-sm",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
