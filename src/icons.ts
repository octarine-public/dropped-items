import { Paths } from "./paths"

/** Glyphs of the menu page: the SDK set where it has one, our own otherwise. */
export const DroppedItemsIcons = {
	/** A package lying on the ground: the page itself. */
	Page: `${Paths.Icons}/package.svg`,
	State: Menu.Icons.Power,
	Size: Menu.Icons.Expand,
	Rounding: Menu.Icons.Radius
} as const
