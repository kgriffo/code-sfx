import * as vscode from "vscode";

//class definitions
/**
 * Defines tree view of command buttons for CodeSFX
 */
export class CommandButtons implements vscode.TreeDataProvider<Button> {
  constructor() {}
  onDidChangeTreeData?:
    | vscode.Event<void | Button | Button[] | null | undefined>
    | undefined;
  getTreeItem(element: Button): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(element: Button | undefined): vscode.ProviderResult<Button[]> {
    const activeLanguage: string | undefined =
      vscode.window.activeTextEditor?.document.languageId;
    return [
      new Button(
        "Get Terminal Output",
        "codesfx.getTerminalOutput",
        "Grabs terminal output and plays sound effects",
        new vscode.ThemeIcon("debug-start")
      ),
      new Button(
        "Toggle SFX",
        "codesfx.toggleWhileCodingSFX",
        "Toggles SFX that play while coding",
        new vscode.ThemeIcon("debug-stop")
      ),
    ];
  }
}

/**
 * Defines command buttons
 */
class Button extends vscode.TreeItem {
  constructor(
    label: string,
    commandId: string,
    tooltip?: string,
    icon?: vscode.ThemeIcon
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: commandId,
      title: label,
    };
    this.tooltip = tooltip || "";
    this.iconPath = icon || new vscode.ThemeIcon("play-circle");
  }
}
