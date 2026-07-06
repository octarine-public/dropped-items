import {
	AnchorKind,
	Color,
	GUIInfo,
	Item,
	PhysicalItem,
	Rectangle,
	RendererSDK,
	TextFlags,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "./menu"

export class ItemGUI {
	private static readonly border = 3
	private static readonly minSize = 16
	private static readonly fontWidth = 500
	private static readonly outlineColor = Color.Black

	private readonly position = new Rectangle()

	constructor(private readonly menu: MenuManager) {}

	public Draw(item: Item, physicalItem: PhysicalItem) {
		const size = this.menu.Size.value + ItemGUI.minSize,
			itemSize = GUIInfo.ScaleVector(size, size),
			halfSize = itemSize.DivideScalar(2)

		const w2s = RendererSDK.WorldToScreen(physicalItem.Position)
		if (w2s === undefined || this.Contains(w2s.Subtract(halfSize))) {
			return
		}

		this.position.pos1.CopyFrom(halfSize.MultiplyScalar(-1))
		this.position.pos2.CopyFrom(halfSize)

		RendererSDK.DrawEntityRelative(
			physicalItem.Index,
			AnchorKind.Origin,
			() => {
				if (!physicalItem.IsValid) {
					return undefined
				}
				const pos = RendererSDK.WorldToScreen(physicalItem.Position)
				if (pos === undefined || this.Contains(pos.Subtract(halfSize))) {
					return undefined
				}
				return pos
			},
			() => this.DrawContent(item)
		)
	}

	protected DrawContent(item: Item) {
		const level = item.Level,
			cooldown = item.Cooldown,
			texture = item.TexturePath,
			charges = item.CurrentCharges,
			position = this.position

		const border = GUIInfo.ScaleHeight(ItemGUI.border),
			rounding = this.GetRounding(position.Height, position.Width),
			outlineColor = cooldown !== 0 ? Color.Red : ItemGUI.outlineColor

		RendererSDK.Image(texture, position.pos1, rounding, position.Size)

		this.DrawRect(rounding, outlineColor, border)
		this.DrawCharges(charges)
		this.DrawLevel(level, item.MaxLevel)
		this.DrawCooldown(charges, cooldown, this.menu.Size.value)
	}

	protected DrawCooldown(level: number, cooldown: number, additionalSize: number) {
		if (cooldown <= 0) {
			return
		}

		const minOffset = 3,
			noLevel = level <= 1

		const text = cooldown.toFixed(cooldown <= 10 ? 1 : 0),
			canOffset = !noLevel && additionalSize >= minOffset,
			textPosition = canOffset ? this.position.Clone() : this.position

		if (canOffset) {
			textPosition.Add(GUIInfo.ScaleVector(minOffset, minOffset))
		}

		// if no level draw cooldown by center
		const flags = noLevel ? TextFlags.Center : TextFlags.Left | TextFlags.Top
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

	protected DrawRect(rounding: number, outlineColor: Color, border: number) {
		RendererSDK.RectRounded(
			this.position.pos1,
			this.position.Size,
			rounding,
			Color.fromUint32(0),
			outlineColor,
			border + +(rounding > 0)
		)
	}

	protected GetRounding(height: number, width: number): number {
		const rnd = (this.menu.Rounding.value / 10) * Math.min(width, height)
		return rnd === 1 ? -1 : rnd - 1
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
		color = Color.White
	) {
		RendererSDK.TextByFlags(text, position, color, division, flags, ItemGUI.fontWidth)
	}
}
