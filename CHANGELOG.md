# Changelog

## 2.2.0

- add connection to CEP "Spy" plugin to get more events from Photoshop. This plugin is not distributed and enabled by default.

adds these document properties
cloudDocument
compositor
homeScreenReady // nope? - feature dependent?
isCloudDoc
overscrollMode // nope
slices
targetPathsVisibility // nope
visible
watchSuspension // nope?

new path properties
AGMStrokeStyleInfo
symmetryPath

new document properties
layerGroup // nope
layerGroupExpanded // nope
layerTransformation // ???
parentLayerID
selection // ???
text // ???
AGMokeStyleInfo // nope

new application properties
active
autoShowHomeScreen
brushes
brushSettingsLocks
customPreference
gridMinor
hasMatchingOpenDoc // ??? needs aditional descriptor?
homeScreenReady
keyboardFocus
$PnCK - paintCursorKind
modalDialogLevel
modalToolLevel
mondoFilterLevel
multiUndoEnabled
numberOfActionSets
pluginPrefs
VMStatus
springLoadedTools
springLoadedToolsTimingSensitivity
LoadedPluginsNames


Note: Use "reset alchemist state" to load these new properties.

## 2.1.0

- fix: another fix for PS 23.3.0 since last fix broke it in PS 23.2.x  
This change makes plugin incompatible with PS 23.2.x and lower.  
If you want to use alchemist in 23.2.x or lower then use Alchemist version 2.0.2 or lower

## 2.0.3

- fix: in PS 23.3.0 it does not load due to launchProcess  permission. Therefore in this version it is fixed

## 2.0.2

- improves: better default values in Sorcerer (suspendHistory and executeAsModal)
- improves: less restrictive default values for panel sizes
- improves: more flexible defaults for panel size
- fixes: plugin files not generated properly
- fixes: Creative Cloud Desktop does not recognize generated .ccx file as a valid plugin

## 2.0.1

- adds feature to export/import sorcerer preset

## 2.0.0

- feature: Adds new Sorcerer panel

## 1.5.2

- fixes: problem when permission worked in PS 23 but broke plugin in PS 22.5

## 1.5.1

- fixes: network and file access permission issues in PS 23.0.0
- improvement: shows warning when Occulist passes more items than is limit in Alchemist settings

## 1.5.0

- feature: adds Occultist panel for generating source code from .ATN files and inspecting them
- fixes: permission issue in PS 23.0.0

## 1.4.0

- feature: adds indentation option into generated code
- feature: adds single quotes option into generated code
- feature: adds options to hide useless properties
- change: property names in generated code are now without quotes where possible
- adds types to the components
- fix: UI crash in DOM (live) when object is proxy (e.g. array of layers in document)
- improvement: adds history states and snapshots into DOM (live)
- improvement: left column adjustable width is now expressed in pixels instead of percentage and it is remembered after panel reload

## 1.3.0

- adds raw data type support (needs to be enabled in Code > Options)
- adds grouping of items with same content
- adds "hard ignore" feature into settings (event names that never will be recorded in any way)
- fixes dispatcher (now it requires `return` keyword if you want inspect result)
- fixes error with `eval`
- shows compatible PS versions for AM converter
- internal - updates node modules and upgrades to Webpack 5

## 1.2.1

- min. required PS version hotfix
- code cleanup

## 1.2.0

- improvement: add explaining labels to the dialog modes <https://github.com/jardicc/alchemist/issues/8>
- improvement: option to choose font size: <https://github.com/jardicc/alchemist/issues/5>
- improvement: adds possibility to show message strip with link
- fix: do not load incompatible version of panel state from json file
- fix: wrong layer property names <https://github.com/jardicc/alchemist/issues/13> <https://github.com/jardicc/alchemist/issues/11>

## 1.1.0

- improvement: adds AM Converter tool

## 1.0.1

- change: revert button back due to bug cause Photoshop to crash
- workaround: replaces textarea with div placeholder when menu is opened to solve z-index bug in PS
- fix: menu should not be now rendered outside of plugin and cropped

## 1.0.0

- change: button menus in footer are now using dropdown so those can be shown out of panel boundary

## 0.27.0

- improvement: shows error dialog when something fails outside of react error component
- workaround: allows to make production version of plugin. See: <https://forums.adobeprerelease.com/photoshop/discussion/2138/severe-issue-with-listener-in-production-use#latest>
- improvement: adds info in footer whether this is production or development version of plugin. Also adds copyright.
- improvement: generates "await" keyword for async batchplay
- improvement: won't generate nonsense code for replay reply and dispatched code
- improvement: disables replay button for replay reply and dispatched code
- improvement: shows notification when adding of descriptor failed
- improvement: shows notification when replay failed
- change: "hides used" filter tab
- change: in Marketplace version of plugin it shows dialog about Photoshop limitations

## 0.26.0

- feature: adds partial support for raw data type (fake structure in views and attempt to generate code in code tab)
- feature: adds possibility to enable/disable raw data type support
- feature: add expand slider into tree views
- improvement: breadcrumb in tree view is now at fixed position when scrolling

## 0.25.0

- feature: adds possibility to set batchPlay options for selected descriptors and also default settings for recorded items
- improvement: adds new icon (made by Petr Štefek <https://www.behance.net/phob> )
- improvement: removes right bottom artifact
- improvement: cleaner path to the pinned property in generated source code
- improvement: now it shows autoselected descriptor underline for only autoactive items. 2 for difference 1 for others
- fix: initial text flash from black to theme color

## 0.24.0

- feature: adds menu item to reset panel settings
- feature: adds possibility to rename item
- feature: adds clear non-existent. Uses built-in validate reference method. Currently it checks whether it can get those data.
- improvement: finishes export/import
- improvement: shows error message instead of blank screen and offers reload and reset panel state
- improvement: shows bulk buttons allowance based on items selection
- improvement: click on empty space bellow descriptor items will deselect all items similar to layer panel

## 0.23.0

- feature: adds dispatcher
- feature: adds replay
- feature: adds more version numbers in footer

## 0.22.0

Merges Inspector and listener panels

- shows by default content of item  first for more tabs if none is selected
- adds auto inspector feature
- adds possibility of continuous selection with Shift (add) or Ctrl+Shift (subtract)
- implements search
- implements merged raw content view
- implements merged batch play code generation
- shows "Event" for listened event instead of time. Since time is unknown
- feature possibility to remove item (not) in view
- reverse order of descriptor items
- autosafe for inspector panel after 10 seconds inactivity
- pinned item can now be autoselected
- item title is now not calculated but stored inside of item

## 0.21.0

Inspector only

- feature: changes reference into copy/paste ready generated code

## 0.20.0

Inspector only

- improves: tree expansion is not stored in redux state so it remembers expansions when you switch the tree
- feature: recursive expand/collapse when you hold key and click item (you have to hold Alt key all the time until it is expanded). Has protection against circular dependencies
- improves: default sizes for panels
- feature: adds items into dropdown lists (e.g. document names)
- fix: inspector loading

## 0.19.0

Inspector only

- improves: divider between left and right column is now resizable
- fix: all data views are now stretched at the height and scrollable
- known issue: dropdown has fixed width. I am waiting for Adobe to fix UXP
- known issue: DOM view can sometimes cause plugin crash
- known issue: textarea has no scrollbar. I am waiting for Adobe to fix UXP

## 0.18.0

Inspector only

- improves: shows names in descriptor titles
- improves: content tree view can pin primitive values
- improves: tree view was forked and customized
- improves: tree view has now mode allowing to show prototyped properties
- feature: adds DOM tab to inspect PS DOM

## 0.17.0

Inspector only

- improves: data in info tab are now in textareas
- improves: tree view with breadcrumb for descriptor content

## 0.16.0

Inspector only

- feature: tree difference mode
- feature: tree difference mode breadcrumb

## 0.15.0

Inspector only

- feature: adds possibility to filter list of descriptors
- feature: adds difference view
- improves: descriptor item title in list
- improves: icons instead of text

## 0.14.0

Inspector only

- improves: support for PS theme switching
- improves: panel colors
- feature: clear button now removes all non-locked descriptors
- feature: lock prevents removal
- feature: pin keeps items at the top

## 0.13.0

Inspector only

- improves: layout, styling and also scrolling
- feature: lock, pin, remove buttons for selected actions
- improves: names for recorded descriptors

## 0.12.0

Inspector only

- adds: Inspector panel. Work in progress. Bugs included.

## 0.11.0

- fix: initial value in filter dropdown
- change: event names now can contain space at the begging and end (trim) within semicolon separated exclude/include string
- change: plugin icon by "rechmbrs"
- fix: changes utf8 symbols into icon components and fixes icons on MacOS
- feature: adds modalBehavior when playable code is turned on
- feature: shows version number in footer

## 0.10.0

- feature: possibility to add/remove action event name into include/exclude filter list using action menu
- feature: export/import plugin state (settings+actions)
- feature: append actions from JSON file
- feature: remove action from list (not a filter)

## 0.9.0

- change: playable code adds explicit default options

## 0.8.0

- feature: whole state of panel is now saved in real-time and loaded with panel start. Panel will ignore whether listening was on/off last time and will be always off after panel load.

## 0.7.0

- feature: grouping of same actions. This also merges replies.
- change: splits event name and history step title. Therefore search works only for event name.

## 0.6.0

- bug fix: fixes "clear" button
- changes "batch play" button into checkbox

## 0.5.0

- change: listener by default filter action generally considered as garbage (although you can find some use for them)
- feature: add include exclude filter
- feature: shows play replies

## 0.4.0

- feature: adds possibility to filter by name (case sensitive)
- code: implements Redux store

## 0.3.0

- feature: adds play button
- improvements: UI
- code: adds types

## 0.2.0

- feature: collapsible actions
- feature: default option for collapsible action

## 0.1.0

- initial release
