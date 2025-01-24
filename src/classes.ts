import * as vscode from "vscode";

/**
 * Defines tree view of CodeSFX command buttons
 */
export class CommandButtonsProvider
  implements vscode.TreeDataProvider<CommandButton>
{
  constructor() {}

  getTreeItem(
    element: CommandButton
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(
    element: CommandButton | undefined
  ): vscode.ProviderResult<CommandButton[]> {
    const activeLanguage: string | undefined = //for use later... maybe
      vscode.window.activeTextEditor?.document.languageId;
    return [
      new CommandButton(
        "Get Terminal Output",
        "codesfx.getTerminalOutput",
        "Grabs terminal output and plays sound effects",
        new vscode.ThemeIcon("debug-start")
      ),
      new CommandButton(
        "Toggle SFX",
        "codesfx.toggleWhileCodingSFX",
        "Toggles SFX that play while coding",
        new vscode.ThemeIcon("debug-stop")
      ),
    ];
  }
}

/**
 * Defines buttons for CodeSFX commands
 */
class CommandButton extends vscode.TreeItem {
  constructor(
    label: string,
    commandId: string,
    tooltip?: string,
    icon?: vscode.ThemeIcon
  ) {
    super(label);
    this.command = {
      command: commandId,
      title: label,
    };
    this.tooltip = tooltip || "";
    this.iconPath = icon || new vscode.ThemeIcon("play-circle");
  }
}
