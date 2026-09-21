import { DroppedItemsIcons } from "./icons"

export class MenuManager {
	public readonly Tree: Menu.Node
	public readonly Size: Menu.Slider
	public readonly State: Menu.Toggle
	public readonly Rounding: Menu.Slider
	public readonly Shape: Menu.Dropdown
	public readonly OpacityByCursor: Menu.Toggle
	public readonly Opacity: Menu.Slider
	public readonly HoverOpacity: Menu.Slider

	private readonly visual = Menu.AddEntry("Visual")

	constructor() {
		this.Tree = this.visual.AddNode(
			"Dropped items",
			DroppedItemsIcons.Page,
			"Drawing dropped items in the world"
		)
		this.Tree.SortNodes = false

		// the script's own switch rides the header of the page and gates it
		this.State = this.Tree.AddToggle("State", true)
		this.State.IconPath = DroppedItemsIcons.State
		this.Tree.HeaderControl = this.State
		this.Tree.Gate = this.State

		this.Size = this.Tree.AddSlider(
			"Image size",
			15,
			0,
			30,
			0,
			"Additional size of an item lying in the world"
		)
		this.Size.IconPath = DroppedItemsIcons.Size

		this.Shape = this.Tree.AddDropdown("Shape", ["Rectangle", "Square"])
		this.Shape.IconPath = Menu.Icons.GridPick

		this.Rounding = this.Tree.AddSlider(
			"Image rounding",
			6,
			0,
			10,
			0,
			"Corner radius of the icon, in pixels at 1080p"
		)
		this.Rounding.IconPath = DroppedItemsIcons.Rounding

		this.OpacityByCursor = this.Tree.AddToggle(
			"Opacity on hover",
			true,
			"Fade dropped items near the mouse"
		)
		this.OpacityByCursor.IconPath = Menu.Icons.HoverArrow
		this.Opacity = this.Tree.AddSlider("Opacity", 90, 50, 100)
		this.Opacity.Suffix = "%"
		this.Opacity.IconPath = Menu.Icons.Checkerboard
		this.HoverOpacity = this.Tree.AddSlider(
			"Hover opacity",
			80,
			50,
			100,
			0,
			"Percentage of normal opacity kept near the mouse"
		)
		this.HoverOpacity.Suffix = "%"
		this.HoverOpacity.IconPath = Menu.Icons.HoverArrow
	}
}
