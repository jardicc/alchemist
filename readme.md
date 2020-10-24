# Alchemist for Photoshop

Listens all (most of) Photoshop events. Something like actions panel in Photoshop but for scripting. Or ScriptListener plugin for ExtendScript but in panel. Also can inspect PS DOM and show PS AM descriptors from various places.

## Disclaimer
You are using this software at your own risk. Possibly Photoshop could crash if you ask Photoshop to do something unusual via Alchemist. So just save your work if you are concerned.

## Difference between Marketplace and Development version
Feature to listen to all Photoshop events is available only in Development version. This is intentionally forbidden by Adobe in Production version of plugin. Alchemist tries to listen to as many events as possible but it might perform badly. If you don't need Listener then it doesn't matter which version you will use.

## Quick usage - Development version (Recomended)
In Photoshop enable Developer Mode `PS > Edit > Preferences > Plugins > Enable Developer Mode`.

Install "Adobe UXP Developer Tool" if not already installed. (Get it here: https://www.adobe.io/photoshop/uxp/devtool/#download ) 
Click add plugin button. And open `dist\manifest.json` in dialog. Then click "load" in actions.

## Even quicker usage - Marketplace version  (Not prefered)
Download `installer/2bcdb900.ccx` installer file in https://github.com/jardicc/alchemist/raw/master/installer/2bcdb900.ccx And double click file in file explorer.

## Quickest usage - Marketplace version  (Not prefered)
You just click the button to add plugin automatically in Photoshop from Marketplace https://adobe.com/go/cc_plugins_discover_plugin?pluginId=2bcdb900&workflow=share

## Panel Entrypoints
The extension will be available in `Plugins > Alchemist > Alchemist` menu with the extension's name. This will open up a PS panel with your extension loaded in it.

## Plugin settings
I hope you won't need to do anything with that file but in case that something goes wrong it is here.
Panel settings for development version on Window can be found in: 
```
c:\Users\<AccountName>\AppData\Roaming\Adobe\UXP\PluginsStorage\PHSP\22\Developer\cz.bereza.alchemist\PluginData\settings.json
```

or for marketplace version
```
c:\Users\<AccountName>\AppData\Roaming\Adobe\UXP\PluginsStorage\PHSP\22\Internal\cz.bereza.alchemist\PluginData\settings.json
```


# Dev Setup
To enable UXP development and see your panels in Photoshop, you will need to enable that in Photoshop preferences.
`PS > Edit > Preferences > Plugins > Enable Developer Mode`

Install the dependencies:

```
npm install
```

Run webpack to bundle

```
npm build
# or "npm watch" to watch for file changes and rebuild automatically
```
Load plugin as described above in quick usage section.

## Debugging

In "Adobe UXP Developer Tool" click actions triple dot and click debug.
