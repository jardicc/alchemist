# Changelog

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