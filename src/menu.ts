import { ImageData, Menu } from "github.com/octarine-public/wrapper/index"

export class MenuManager {
	public readonly Size: Menu.Slider
	public readonly State: Menu.Toggle
	public readonly Rounding: Menu.Slider

	private readonly node = Menu.AddEntry("Visual")

	private readonly icon = ImageData.Icons.magic_resist
	private readonly tree = this.node.AddNode(
		"Dropped items",
		this.icon,
		"Drawing dropped items in the world"
	)

	constructor() {
		this.State = this.tree.AddToggle("State", true)
		this.Size = this.tree.AddSlider("Image size", 15, 0, 30)
		this.Rounding = this.tree.AddSlider("Image rounding", 10, 0, 10)
	}
}
