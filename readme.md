# Alchemist for Photoshop ~~(Listener + Inspector)~~

Listens all (most of) Photoshop events. Something like actions panel in Photoshop but for scripting. Or ScriptListener plugin for ExtendScript but in panel. Also can inspect PS DOM and show PS AM descriptors from various places.

## Disclaimer

This software was not created by Adobe and Adobe is not responsible for it. You are using this software on your own risk and I am also not responsible for anything. I personally don't expect any big issue. But because someone in USA can use this software... and people there love to sue for nonsense... :-D 

## Quick usage

Install "Adobe UXP Developer Tool" if not already installed. Click add plugin button. And open `dist\manifest.json` in dialog. Then click "load" in actions.

Panel settings on Window can be found in: 
```
c:\Users\<AccountName>\AppData\Roaming\Adobe\UXP\PluginsStorage\PHSP\22\Developer\cz.bereza.alchemist\PluginData\settings.json
```

or for non-developers 
```
c:\Users\<AccountName>\AppData\Roaming\Adobe\UXP\PluginsStorage\PHSP\22\Internal\cz.bereza.alchemist\PluginData\settings.json
```

## Dev Setup

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

## (PreRelease) Prerequisites

While we're still developing UXP, we want to make sure these features are behind flags so they don't affect end users. To enable UXP development and see your panels in Photoshop, you will need to enable that in Photoshop preferences.
`PS > Edit > Preferences > Plugins > Enable Developer Mode` and also `PS > Edit > Preferences > Technology Previews > UXPEnablePluginMarketPlace`

## Panel Entrypoints

The extension will be available in `Plugins > Alchemist > Alchemist` menu with the extension's name. This will open up a PS panel with your extension loaded in it.


## Debugging

In "Adobe UXP Developer Tool" click actions triple dot and click debug.
