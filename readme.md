# Blocks4Gina

Gina was playing blocks at 1001games, I thought the game was ugly and it would be fun to make my own. Mostly I'm just playing around with making a game using canvas api.

## Todos
### New Features
 - undo/redo stack (via serialized game state?)
 - high scores somewhere
 - game analysis (e.g. compute max remaining score?)

### Enhancements
 - Consider putting music buttons in settings
 - mobile: better layout esp. ui, disable preview with touch
 - reset button for settings
 - could do better with responsive layout (settings, scoreboard)...

### Optimization
 - optimize render with blockdirty or column dirty...or even tiling

### Debug
 - FR tracking
 - logging

### Bugs
 - still a bug in deserialization of bigger grids, can't reliably repro
 - floodfill with giant grids recursion
 - need to apply down-move before left-move