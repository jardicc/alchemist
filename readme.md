# Listener - UXP for Photoshop

Listens all Photoshop events. Something like actions panel in Photoshop but for scripting.

## Disclaimer

This software was not created by Adobe and Adobe is not responsible for it. You are using this software on your own risk and I am also not responsible for anything. I personally don't expect any big issue. But because someone in USA can use this software... and people there love to sue for nonsense... :-D 

## Quick usage

Move/symlink `dist` folder itself (not its content) 
into: `C:\Program Files\Common Files\Adobe\UXP\extensions` 
or `/Library/Application Support/Adobe/UXP/extensions/`

Panel settings on Window can be found in: `c:\Users\<yourAccountName>\AppData\Local\UXP\PluginsData\Internal\cz.bereza.uxp_listener\settings.json`

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

Soft link the dist folder into your extension folder

```
sudo ln -s [path to repo/dist] /Library/Application\ Support/Adobe/UXP/extensions/[name-of-extension]
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


## Debugging

In Chrome, navigate to `chrome://inspect`. Press Configure... next to Discover network targets checkbox, and add localhost:9444 (or the port you declared in your debug.json). 

When the extension is loaded, it should show up with it's ID on this page.