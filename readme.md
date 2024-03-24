# Blocks4Gina

Gina was playing blocks at 1001games, I thought the game was ugly and it would be fun to make my own. Mostly I'm just playing around with making a game using canvas api.

## Todos
### Cleanup
 - make `uinode` a class or at least put it somewhere so it's not c/p
 - cleanup of listener creation, own class or sep/concerns
 - make it a custom element
 - move scoreboard update out of `renderer`, cleanup
 - clean some naming patterns (game prefix etc.)

### New Features
 - undo/redo stack (via serialized game state?)
 - add game played clock (and serialize/deserialize it)...
 - high scores somewhere
 - game analysis (e.g. compute max remaining score?)

### Enhancements
 - Better canvas sizing to support tall layouts without scrolling
 - Consider putting music buttons in settings
 - mobile: better layout esp. ui, disable preview with touch
 - reset button for settings

### Optimization
 - optimize render with blockdirty or column dirty...or even tiling

### Debug
 - FR tracking
 - logging
