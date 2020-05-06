# uxp-starter-extension

Quick starter extension for writing UXP extensions.

## Setup

First, make sure you update three things:

 1 In uxp/manifest.json, change `name` and `ID` for your own extension
 
 2 In uxp/manifest.json, change `uiEntrypoints > panelInfo > title > default` for what you want your extension to show as under extensions menu
 
 3 In uxp/debug.json, change `port` to a value that you're sure other extensions don't use

Install the dependencies:

```
yarn install
```

Run webpack to bundle

```
yarn build
# or "yarn watch" to watch for file changes and rebuild automatically
```

Soft link the dist folder into your extension folder

```
sudo ln -s [path to repo/dist] /Library/Application\ Support/Adobe/UXP/extensions/[name-of-your-extension]
```

On Windows, create a link to the folder at

```
C:\Program Files\Common Files\Adobe\UXP\extensions
```

## (PreRelease) Prerequisites

While we're still developing UXP, we want to make sure these features are behind flags so they don't affect end users. To enable UXP development and see your panels in Photoshop, you will need to add a line to your PSUserConfig.txt file.

Windows:
> C:\Users\{user}\AppData\Roaming\Adobe\Adobe Photoshop 2020 Settings\PSUserConfig.txt

Mac:
> /Users/{user}/Library/Preferences/Adobe Photoshop 2020 Settings/PSUserConfig.txt

Open (or create) this text file, and add the following line:

> `ScriptDeveloper 1`

This will enable Photoshop to start loading UXP extensions, and support your custom panels. 

## Panel Entrypoints

The ui entrypoint of a UXP extension as a panel is defined in it's `manifest.json` file. This is subject to change, so please refer to latest copy of the starter repository as above.

The extension will be available in Window > Extensions menu with the extension's name. This will open up a PS panel with your extension loaded in it.

### Panel Flyout Menus

The extension's `manifest.json` file allows for the static definition of panel menu items. A flat list of items are supported under `panelInfo` as such:

```
"flyoutMenu" : [
    {"title": {"default": "Command 1"}, "command": "flyoutMenuCommand1"},
    {"title": {"default": "Command 2"}, "command": "flyoutMenuCommand2"},
]
```

Ensure that the invoked command or function is available globally.

## Debugging

In Chrome, navigate to `chrome://inspect`. Press Configure... next to Discover network targets checkbox, and add localhost:9240 (or the port you declared in your debug.json). 

When the extension is loaded, it should show up with it's ID on this page.