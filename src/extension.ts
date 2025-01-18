import * as vscode from "vscode";
import sound from "sound-play";
import path from "path";

//class definitions for command buttons
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
    ];
  }
}

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

// functions
// incomplete. the goal is to make a mutable SFX function
function playSFX(context: vscode.ExtensionContext, soundName: string) {
  soundName = "";
  let sfxFolder: string = "sfx";
  const filePath = path.join(context.extensionPath, sfxFolder, soundName);
  sound.play(filePath);
}

function getTerminalOutput(context: vscode.ExtensionContext) {
  vscode.commands
    .executeCommand("workbench.action.terminal.selectAll")
    .then(() => {
      vscode.commands
        .executeCommand("workbench.action.terminal.copySelection")
        .then(async () => {
          let output: Thenable<string> = vscode.env.clipboard.readText();
          if ((await output).includes("Error")) {
            const filePath: string = path.join(
              context.extensionPath,
              "sfx",
              "doorbell.mp3"
            );
            sound.play(filePath);
            vscode.commands.executeCommand(
              "workbench.action.terminal.clearSelection"
            );
          } else {
            const filePath: string = path.join(
              context.extensionPath,
              "sfx",
              "iphone-chime.mp3"
            );
            sound.play(filePath);
          }
          vscode.commands.executeCommand(
            "workbench.action.terminal.clearSelection"
          );
        });
    });
}

// activation function
export function activate(context: vscode.ExtensionContext) {
  console.log("CodeSFX is now active!");

  // vscode severity codes for different diagnostics
  const err = 0;
  const warn = 1;
  const info = 2;
  const hint = 3;

  // listens for diagnostics while coding; triggers sounds accordingly
  vscode.languages.onDidChangeDiagnostics(() => {
    const diagnostics: [vscode.Uri, vscode.Diagnostic[]][] =
      vscode.languages.getDiagnostics();
    while (diagnostics.length > 0) {
      let diag = diagnostics.pop();
      if (diag !== undefined) {
        let diagArray: vscode.Diagnostic[] = diag[1]; //array of diagnostics (diag[0] = uri)
        diagArray.forEach((item: vscode.Diagnostic) => {
          if (item.severity === err) {
            setTimeout(() => {
              const filePath: string = path.join(
                context.extensionPath,
                "sfx",
                "notification-beep.mp3"
              );
              sound.play(filePath);
            }, 1000);
          }
          if (item.severity === warn) {
            setTimeout(() => {
              const filePath: string = path.join(
                context.extensionPath,
                "sfx",
                "airplane-beep.mp3"
              );
              sound.play(filePath);
            }, 1000);
          }
        });
      }
    }
  });

  // scans terminal output; triggers sounds accordingly
  let disposable: vscode.Disposable = vscode.commands.registerCommand(
    "codesfx.getTerminalOutput",
    () => {
      getTerminalOutput(context);
    }
  );

  // Register the Tree Data Provider
  const commandButtonsProvider = new CommandButtons();
  vscode.window.createTreeView("codesfx", {
    treeDataProvider: commandButtonsProvider,
  });
  context.subscriptions.push(disposable);
}
export function deactivate() {}
