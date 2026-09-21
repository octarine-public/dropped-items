import { canvas, surface } from "../render"
import { MenuManager } from "./menu"

/** The icon's height before the size slider adds to it, at 1080p. */
const MIN_SIZE = 16
/** How much wider than tall an icon stands: the shape the game cuts an item's art in. */
const ITEM_RATIO = 1.375
/** The weight every reading over an icon is set in. */
const FONT_WEIGHT = 500
/** Tenths show on a cooldown once it drops under this many seconds. */
const TENTHS_UNDER = 10
/** How far a corner reading is nudged inward to clear the edge, at 1080p. */
const CORNER_OFFSET = 3
/** How far the shadow reaches out from an icon, as a fraction of its height. */
const SHADOW_FRACTION = 0.1
/** The shadow's reach in px at the smallest an icon gets. */
const SHADOW_MIN = 2
/** The room the shader's antialiased edge needs off the quad's boundary, as a rectangle keeps. */
const SDF_INSET = 1
/** The shadow an icon is set on: black at six tenths, the one the game's buff icons wear. */
const SHADOW = new Color(0, 0, 0, 153)
const INK = Color.White

/**
 * One dropped item's icon where it lies. The old renderer anchored the drawing to the entity and
 * left it standing in the persisted 2D layer until something invalidated it; the canvas keeps no
 * drawing of its own between frames, so the position is projected and the icon painted again
 * every frame. What the sliders ask for is the same for every item in a frame, so it is taken
 * once in {@link ItemGUI.BeginFrame} and an item costs its projection and nothing else.
 */
export class ItemGUI {
	private readonly position = new Rectangle()
	/** Where a reading stands once it is nudged off the corner; reused rather than cloned. */
	private readonly offsetPosition = new Rectangle()
	private readonly size = new Vector2()
	private readonly half = new Vector2()
	private readonly offset = new Vector2()
	/** The corner radius of the icon in px, none while the slider stands at zero. */
	private radius = 0
	/** How far the drop shadow reaches out from the icon in px. */
	private shadow = 0
	/** Cursor proximity fades each item's art, shadow and readings together. */
	private opacity = 1

	constructor(private readonly menu: MenuManager) {}

	/**
	 * Takes the box, the corner and the shadow the sliders ask for this frame, so a fight that
	 * leaves a dozen items on the ground scales them once rather than once an item.
	 */
	public BeginFrame() {
		const height = this.menu.Size.value + MIN_SIZE
		const ratio = this.menu.Shape.SelectedID === 1 ? 1 : ITEM_RATIO
		this.size.CopyFrom(GUIInfo.ScaleVector(height * ratio, height))
		this.half.CopyFrom(this.size).DivideScalarForThis(2)
		this.offset.CopyFrom(GUIInfo.ScaleVector(CORNER_OFFSET, CORNER_OFFSET))
		// a radius over half the shorter side is no rounder, and the shader would clamp it anyway
		this.radius = Math.round(
			Math.min(GUIInfo.ScaleHeight(this.menu.Rounding.value), this.size.y / 2)
		)
		this.shadow = Math.max(Math.round(this.size.y * SHADOW_FRACTION), SHADOW_MIN)
	}

	public Draw(item: Item, physicalItem: PhysicalItem) {
		const w2s = RendererSDK.WorldToScreen(physicalItem.Position)
		if (w2s === undefined) {
			return
		}
		const corner = w2s.SubtractForThis(this.half)
		if (this.Contains(corner)) {
			return
		}
		this.position.pos1.CopyFrom(corner)
		this.position.pos2.CopyFrom(corner).AddForThis(this.size)
		this.opacity = this.menu.Opacity.value / 100
		if (this.menu.OpacityByCursor.value) {
			// Use cooldowns' proximity calculation with the selected minimum opacity.
			const cursor = InputManager.CursorOnScreen
			const distance = Math.hypot(
				cursor.x - (corner.x + this.half.x),
				cursor.y - (corner.y + this.half.y)
			)
			this.opacity *= Math.min(
				Math.max(
					this.menu.HoverOpacity.value / 100,
					distance / ((this.size.x + this.size.y) * 4)
				),
				1
			)
		}
		this.DrawContent(item)
	}

	protected DrawContent(item: Item) {
		const level = item.Level,
			cooldown = item.Cooldown,
			texture = item.TexturePath,
			charges = item.CurrentCharges

		this.DrawShadow()
		canvas.Image(texture, this.position.pos1, this.size, {
			color: INK.Clone().SetA(INK.a * this.opacity),
			fit: "cover",
			radius: this.radius
		})

		this.DrawCharges(charges)
		this.DrawLevel(level, item.MaxLevel)
		this.DrawCooldown(charges, cooldown, this.menu.Size.value)
	}

	/**
	 * The soft halo under the icon, falling away from the icon's own edge and nothing inside it:
	 * the drop shadow a round portrait wears in the teleport marker, cut to the same rectangle
	 * and the same corner as the art. The canvas paints no shadow of its own, so the quad goes
	 * onto the surface it draws on, ahead of the art, where the push order puts it underneath.
	 */
	protected DrawShadow() {
		const reach = this.shadow
		surface.Push({
			kind: "rect",
			x: this.position.pos1.x,
			y: this.position.pos1.y,
			w: this.size.x,
			h: this.size.y,
			color: MenuSDK.HudColor(SHADOW, 0),
			glow: reach,
			glowColor: MenuSDK.HudColor(SHADOW, SHADOW.a * this.opacity),
			radius: this.radius,
			sdf: true,
			inset: SDF_INSET + MenuSDK.GlowPad(reach)
		})
	}

	/**
	 * The seconds left on the item, in the middle of the icon while the corners are empty and in
	 * the top-left one once the charges have taken a corner of their own.
	 */
	protected DrawCooldown(charges: number, cooldown: number, additionalSize: number) {
		if (cooldown <= 0) {
			return
		}

		const inCorner = charges > 1

		const text = cooldown.toFixed(cooldown <= TENTHS_UNDER ? 1 : 0),
			canOffset = inCorner && additionalSize >= CORNER_OFFSET

		let textPosition = this.position
		if (canOffset) {
			textPosition = this.offsetPosition
			textPosition.pos1.CopyFrom(this.position.pos1).AddForThis(this.offset)
			textPosition.pos2.CopyFrom(this.position.pos2).AddForThis(this.offset)
		}

		const flags = inCorner ? TextFlags.Left | TextFlags.Top : TextFlags.Center
		this.Text(text, textPosition, flags)
	}

	protected DrawCharges(charges: number) {
		if (charges <= 0) {
			return
		}
		const flags = TextFlags.Bottom | TextFlags.Right
		this.Text(charges.toFixed(), this.position, flags, 2.25)
	}

	protected DrawLevel(level: number, maxLevel: number) {
		if (level <= 1 || maxLevel <= 1) {
			return
		}
		const flags = TextFlags.Top | TextFlags.Right
		this.Text(level.toFixed(), this.position, flags, 2.25)
	}

	protected Contains(pos1: Vector2) {
		return (
			GUIInfo.ContainsShop(pos1) ||
			GUIInfo.ContainsMiniMap(pos1) ||
			GUIInfo.ContainsScoreboard(pos1)
		)
	}

	protected Text(
		text: string,
		position: Rectangle,
		flags: TextFlags,
		division = 2,
		color = INK
	) {
		canvas.TextIn(text, position, {
			color: color.Clone().SetA(color.a * this.opacity),
			flags,
			division,
			weight: FONT_WEIGHT
		})
	}
}
