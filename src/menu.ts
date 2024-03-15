import {
	ImageData,
	Menu,
	NotificationsSDK,
	ResetSettingsUpdated,
	Sleeper
} from "github.com/octarine-public/wrapper/index"

export class MenuManager {
	public readonly Size: Menu.Slider
	public readonly State: Menu.Toggle
	public readonly Rounding: Menu.Slider

	private readonly node = Menu.AddEntry("Visual")

	private readonly icon = ImageData.Paths.Icons.magic_resist
	private readonly tree = this.node.AddNode(
		"Dropped items",
		this.icon,
		"Drawing dropped items in the world"
	)

	constructor(private readonly sleeper: Sleeper) {
		this.State = this.tree.AddToggle("State", true)
		this.Size = this.tree.AddSlider("Image size", 15, 0, 30)
		this.Rounding = this.tree.AddSlider("Image rounding", 10, 0, 10)

		this.tree
			.AddButton("Reset settings", "Reset settings to default values")
			.OnValue(() => this.ResetSettings())
	}

	protected ResetSettings() {
		if (this.sleeper.Sleeping("ResetSettings")) {
			return
		}
		this.State.value = this.State.defaultValue
		this.Size.value = this.Size.defaultValue
		this.Rounding.value = this.Rounding.defaultValue
		this.sleeper.Sleep(2 * 1000, "ResetSettings")
		NotificationsSDK.Push(new ResetSettingsUpdated())
	}
}
