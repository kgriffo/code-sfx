import * as vscode from "vscode";
import sound from "sound-play";
import path from "path";

// incomplete. the goal is to make a mutable SFX function
function playSound(context: vscode.ExtensionContext) {}

function getTerminalOutput(context: vscode.ExtensionContext) {
  vscode.commands
    .executeCommand("workbench.action.terminal.selectAll")
    .then(() => {
      vscode.commands
        .executeCommand("workbench.action.terminal.copySelection")
        .then(async () => {
          let output = vscode.env.clipboard.readText();
          if ((await output).includes("ZeroDivisionError")) {
            const filePath = path.join(
              context.extensionPath,
              "sfx",
              "doorbell.mp3"
            );
            sound.play(filePath);
          } else {
            const filePath = path.join(
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
    const diagnostics = vscode.languages.getDiagnostics();
    while (diagnostics.length > 0) {
      let diag = diagnostics.pop();
      if (diag !== undefined) {
        let diagArray = diag[1]; //array of diagnostics (diag[0] = uri)
        diagArray.forEach((item) => {
          if (item.severity === err) {
            const filePath = path.join(
              context.extensionPath,
              "sfx",
              "notification-beep.mp3"
            );
            sound.play(filePath);
          }
          if (item.severity === warn) {
            const filePath = path.join(
              context.extensionPath,
              "sfx",
              "airplane-beep.mp3"
            );
            sound.play(filePath);
          }
        });
      }
    }
  });

  // scans terminal output; triggers sounds accordingly
  let disposable = vscode.commands.registerCommand(
    "codesfx.getTerminalOutput",
    () => {
      getTerminalOutput(context);
    }
  );

  context.subscriptions.push(disposable);
}
export function deactivate() {}
