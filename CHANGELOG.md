# Changelog

## 0.20.0
Inspector only
- improves: tree expansion is not stored in redux state so it remembers expansions when you switch the tree
- feature: recursive expand/collapse when you hold key and click item (you have to hold Alt key all the time until it is expanded)
- improves: default sizes for panels

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
- improves: content tree view can pin primite values
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
- change: event names now can contain space at the begging and end (trim) within semicolor separated exclude/include string
- change: plugin icon by "rechmbrs"
- fix: changes utf8 symbols into icon components and fixes icons on MacOS
- feature: adds modalBehavior when playable code is turned on
- feature: shows version number in footer


## 0.10.0
- feature: possibility to add/remove action event name into include/exlude filter list using action menu
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
- feature: collapsable actions
- feature: default option for collapsable action

## 0.1.0
- initial release