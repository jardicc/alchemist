import { renderInspectorUI } from "../../inspector/components/inspectorIndex";
import "./../index.less";
import "./../ThemeVars.less";
import { Settings } from "../../inspector/classes/Settings";
import { core } from "photoshop";
import { renderATNDecoderUI } from "../../atnDecoder/components/atnDecoderIndex";
import { renderSorcererUI } from "../../sorcerer/components/sorcererIndex";
import { FlyoutMenu } from "../../inspector/classes/Flyoutmenu";
import manifest from "./../../../uxp/manifest.json";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const uxp = require("uxp");

export class Main {
  public static plugin: any = null;

  static {
    const plugin = [...uxp.pluginManager.plugins].find((p) =>
      p.id.endsWith(manifest.id),
    );
    const symbols = Object.getOwnPropertySymbols(plugin);
    const pluginBaseSymbol = symbols.find(
      (s) => s.toString() === "Symbol(pluginBase)",
    );

    const result = pluginBaseSymbol ? plugin[pluginBaseSymbol] : plugin;
    if ("developerPlugin" in result === false) {
      throw new Error("Cannot get proper plugin object from pluginManager");
    }
    Main.plugin = result;
  }

  public static get devMode(): boolean {
    return Main.plugin.developerPlugin;
  }

  public static get isFirstParty(): boolean {
    return Main.plugin.isFirstParty;
  }

  public static get isThirdParty(): boolean {
    return Main.plugin.isThirdParty;
  }

  public static get privileged(): boolean {
    return Main.plugin.privileged;
  }

  public static start(): void {
    const { suppressResizeGripper } = core as any;

    suppressResizeGripper({ type: "panel", target: "inspector", value: true });
    suppressResizeGripper({ type: "panel", target: "occultist", value: true });
    suppressResizeGripper({ type: "panel", target: "sorcerer", value: true });

    renderInspectorUI();
    renderATNDecoderUI();
    renderSorcererUI();
    FlyoutMenu.setup();
  }
}

function run() {
  window.Main = Main;
  if (Main.isFirstParty) {
    Main.plugin.showPanel("inspector");
  }

  document.addEventListener("uxpcommand", (event: any) => {
    console.log(event);
    if (event.commandId === "resetStateFn") {
      void Settings.reset();
    }
  });
  Main.start();
}

if (Main.devMode) {
  run();
} else {
  try {
    run();
  } catch (e: any) {
    void core.showAlert({
      message: e.stack,
    });
  }
}
