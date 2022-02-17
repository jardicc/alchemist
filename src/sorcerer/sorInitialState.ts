import { Helpers } from "../inspector/classes/Helpers";
import { IEntrypointCommand, IEntrypointPanel, ISnippet, ISorcererState } from "./sorModel";

export function getSorInitialState(): ISorcererState {
      return {
            general: {
                  
            },
            manifestInfo: {
                  manifestVersion: 5,
                  name: "Plugin name",
                  version: "1.0.0",
                  id: "ChangeThisID",
                  main: "index.html",
                  requiredPermissions: {
                        launchProcess: "request",
                  },
                  entrypoints: [
                        makeSorCommand(),
                        makeSorPanel()
                  ],
                  host: [{
                        app: "PS",
                        minVersion: "23.0.0",
                        data: { apiVersion: 2 },
                  }],
                  icons: [{
                        "width": 48,
                        "height": 48,
                        "scale": [1,2],
                        "path": "CHANGE_THIS_relative_path_to_light_icon.png",
                        "theme": ["medium","lightest", "light"],
                        "species": ["pluginList"]
                  },
                  {
                        "width": 48,
                        "height": 48,
                        "scale": [1,2],
                        "path": "CHANGE_THIS_relative_path_to_dark_icon.png",
                        "theme": ["darkest", "dark"],
                        "species": ["pluginList"]
                  }],
            },
            selectedItem: {
                  kind: "general",
                  uuid: null,
            },
            snippets: {
                  list: [
                        makeSorSnippet()
                  ],
            },
      };
}

export function makeSorSnippet(): ISnippet {
      return {
            type: "snippet",
            label: { default: "Make two layers" },
            author: "noName",
            code: `
// you can replace whole code here or just adjust the template

const {app, core, action} = require("photoshop");
const batchPlay = action.batchPlay;

await require("photoshop").core.executeAsModal(async (executionControl, descriptor) => {

   // Suspend history state on the target document
   // This will coalesce all changes into a single history state called
   let suspensionID = await executionControl.hostControl.suspendHistory({
      "documentID": app.activeDocument.id,
      "name": "Custom history name"
   });

   // YOUR CODE GOES HERE
   await batchPlay(
      [{
         _obj: "make",
         _target: [{
            _ref: "layer"
         }],
         _options: {
            dialogOptions: "dontDisplay"
         }
      }], {
         modalBehavior: "execute"
      });
      
   await batchPlay([{
         _obj: "make",
         _target: [{
            _ref: "layer"
         }],
         _options: {
            dialogOptions: "dontDisplay"
         }
      }], {
         modalBehavior: "execute"
      });

   // resume the history state
   await executionControl.hostControl.resumeHistory(suspensionID);
}, {
   "commandName": "Make two layers"
});
`,
            $$$uuid: Helpers.uuidCustom(),
            version: "1.0.0",
      };
}

export function makeSorPanel(): IEntrypointPanel {
      return {
            type: "panel",
            id: "commandID",
            label: { default: "Panel name" },
            icons: [
                  {
                        "width": 23,
                        "height": 23,
                        "scale": [1, 2],
                        "path": "CHANGE_THIS_relative_path_to_dark_panel_icon.png",
                        "theme": ["darkest", "dark", "medium"]
                  }, {
                        "width": 23,
                        "height": 23,
                        "scale": [1, 2],
                        "path": "CHANGE_THIS_relative_path_to_light_panel_icon.png",
                        "theme": ["lightest", "light"]
                  }
            ],
            minimumSize: { height: 100, width: 100 },
            maximumSize: { height: 3000, width: 3000 },
            preferredDockedSize: { height: 300, width: 200 },
            preferredFloatingSize: { height: 300, width: 200 },
            $$$snippetUUIDs: [],
            $$$uuid: Helpers.uuidv4(),
      };
}

export function makeSorCommand(): IEntrypointCommand {
      return {
            type: "command",
            id: "commandID",
            label: { default: "Menu command text" },
            $$$snippetUUID: null,
            $$$uuid: Helpers.uuidv4(),
      };
}