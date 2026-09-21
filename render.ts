/** The key the canvas and the surface under it share, which is what makes them the same one. */
const key = "dropped-items"
const layer = MenuSDK.EPanelLayer.World

export const canvas = new MenuSDK.Canvas(key, layer)
/**
 * The surface the canvas draws on, for the one thing the canvas has no call of its own for: the
 * soft drop shadow under a rectangular icon, pushed as a quad carrying nothing but the shader's
 * glow. {@link MenuSDK.Canvas.CircleTimer} sets a round portrait on the same shadow.
 */
export const surface = MenuSDK.HudSurfaceOf(key, layer)
