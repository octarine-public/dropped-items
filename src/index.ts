import "./translations"

import {
	DOTAGameUIState,
	Entity,
	EventsSDK,
	GameState,
	PhysicalItem,
	Sleeper
} from "github.com/octarine-public/wrapper/index"

import { ItemGUI } from "./gui"
import { MenuManager } from "./menu"

const bootstrap = new (class CWorldItems {
	private readonly sleeper = new Sleeper()
	private readonly menu = new MenuManager(this.sleeper)
	private readonly gui = new ItemGUI(this.menu)

	private readonly items: PhysicalItem[] = []

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

	public GameChanged() {
		this.sleeper.FullReset()
	}
})()

EventsSDK.on("Draw", () => bootstrap.Draw())

EventsSDK.on("GameEnded", () => bootstrap.GameChanged())

EventsSDK.on("GameStarted", () => bootstrap.GameChanged())

EventsSDK.on("EntityCreated", entity => bootstrap.EntityCreated(entity))

EventsSDK.on("EntityDestroyed", entity => bootstrap.EntityDestroyed(entity))
