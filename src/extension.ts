import * as vscode from "vscode";
import { CommandButtonsProvider } from "./classes";
import {
  //functions \\
  runWithCodeSFX,
  toggleWhileCodingSFX,
  whileCodingSFX,
  //variables \\
  isWhileCodingSFX,
} from "./functions";

// activation function
export function activate(context: vscode.ExtensionContext) {
  console.log("CodeSFX is now active!");

  // readies "while coding" SFX feature
  whileCodingSFX(context);

  // command disposables
  let runWithCodeSFXDisp: vscode.Disposable = vscode.commands.registerCommand(
    "codesfx.runWithCodeSFX",
    () => {
      runWithCodeSFX(context);
    }
  );

  let toggleWhileCodingSFXDisp: vscode.Disposable =
    vscode.commands.registerCommand("codesfx.toggleWhileCodingSFX", () => {
      toggleWhileCodingSFX();
      whileCodingSFX(context);
      if (isWhileCodingSFX) {
        vscode.window.showInformationMessage("SFX toggled on");
      }
      if (!isWhileCodingSFX) {
        vscode.window.showInformationMessage("SFX toggled off");
      }
    });

  // register the Tree Data Provider
  const commandButtonsProvider = new CommandButtonsProvider();
  vscode.window.createTreeView("codesfx", {
    treeDataProvider: commandButtonsProvider,
  });
  context.subscriptions.push(runWithCodeSFXDisp, toggleWhileCodingSFXDisp);
}
// deactivation events \\
// reverts highlight to default blue color
vscode.workspace
  .getConfiguration()
  .update(
    "workbench.colorCustomizations",
    { "terminal.selectionBackground": "#00000000" },
    vscode.ConfigurationTarget.Global
  );
//deactivates extension
export function deactivate() {}
