import * as vscode from "vscode";
import { CommandButtons } from "./classes";
import {
  getTerminalOutput,
  toggleWhileCodingSFX,
  updateDiagnosticsListener,
  whileCodingSFX,
} from "./functions";

// activation function
export function activate(context: vscode.ExtensionContext) {
  console.log("CodeSFX is now active!");

  // sets up listener for "while coding" SFX feature
  updateDiagnosticsListener(context);

  // command disposables
  let getTerminalOutputDisp: vscode.Disposable =
    vscode.commands.registerCommand("codesfx.getTerminalOutput", () => {
      getTerminalOutput(context);
    });

  let toggleWhileCodingSFXDisp: vscode.Disposable =
    vscode.commands.registerCommand("codesfx.toggleWhileCodingSFX", () => {
      toggleWhileCodingSFX();
      updateDiagnosticsListener(context);
      if (whileCodingSFX) {
        vscode.window.showInformationMessage("SFX toggled on");
      }
      if (!whileCodingSFX) {
        vscode.window.showInformationMessage("SFX toggled off");
      }
    });

  // register the Tree Data Provider
  const commandButtonsProvider = new CommandButtons();
  vscode.window.createTreeView("codesfx", {
    treeDataProvider: commandButtonsProvider,
  });
  context.subscriptions.push(getTerminalOutputDisp, toggleWhileCodingSFXDisp);
}
export function deactivate() {}
