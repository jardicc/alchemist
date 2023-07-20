import { ActionDescriptor } from "photoshop/dom/CoreModules";
import crc from "crc-32";

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const fs = require("fs");
import fs from "fs";
import { IFileContent } from "./harvester-types";
import { HarvesterControl } from "./HarvesterControl";
import { Harvester } from "./Harvester";

export class HarvesterFS extends Harvester {
  private lastEditHandler!: number;
  private lastSaveHandler!: number;
  private unsaved = false;

  constructor(eventName: string, parent: HarvesterControl) {
    super(eventName, parent);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.lastSaveHandler = window.setInterval(this.saveStack, 15_000);
  }

  private dispose = async () => {
    await this.saveStack();
    this.stack = {};
    this.parent.disposeHarvester(this.eventName);
  };

  public add = (desc: ActionDescriptor) => {
    this.unsaved = true;
    window.clearTimeout(this.lastEditHandler);
    this.stripData(desc);
    const crc = this.getCrc(desc);
    this.stack[crc] = desc;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.lastEditHandler = window.setTimeout(this.dispose, 120_000);
  };

  public saveStack = async () => {
    if (this.unsaved) {
      await this.writeFile(this.stack);
      this.unsaved = false;
    }
  };
}
