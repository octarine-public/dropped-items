import "./translations"

import {
	DOTAGameUIState,
	Entity,
	EventsSDK,
	GameState,
	PhysicalItem
} from "github.com/octarine-public/wrapper/index"

import { ItemGUI } from "./gui"
import { MenuManager } from "./menu"

new (class CWorldItems {
	private readonly menu = new MenuManager()
	private readonly gui = new ItemGUI(this.menu)
	private readonly items: PhysicalItem[] = []

	constructor() {
		EventsSDK.on("Draw", this.Draw.bind(this))
		EventsSDK.on("EntityCreated", this.EntityCreated.bind(this))
		EventsSDK.on("EntityDestroyed", this.EntityDestroyed.bind(this))
	}

	private get shouldDraw() {
		return (
			this.menu.State.value &&
			GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
		)
	}

	public Draw() {
		if (!this.shouldDraw || !this.items.length) {
			return
		}
		for (let index = this.items.length - 1; index > -1; index--) {
			const physicalItem = this.items[index],
				item = physicalItem.Item
			if (item === undefined || !item.IsValid) {
				continue
			}
			this.gui.Draw(item, physicalItem.Position)
		}
	}

	public EntityCreated(entity: Entity) {
		if (entity instanceof PhysicalItem) {
			this.items.push(entity)
		}
	}

	public EntityDestroyed(entity: Entity) {
		if (entity instanceof PhysicalItem) {
			this.items.remove(entity)
		}
	}
})()
