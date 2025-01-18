import * as vscode from "vscode";
import sound from "sound-play";
import path from "path";

// function variables
export let whileCodingSFX: boolean = true;

// functions
export function toggleWhileCodingSFX() {
  whileCodingSFX = !whileCodingSFX;
}

// incomplete. the goal is to make a mutable SFX function
export function playSFX(context: vscode.ExtensionContext, soundName: string) {
  soundName = "";
  let sfxFolder: string = "sfx";
  const filePath = path.join(context.extensionPath, sfxFolder, soundName);
  sound.play(filePath);
}

export function getTerminalOutput(context: vscode.ExtensionContext) {
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

export let diagnosticListener: vscode.Disposable | undefined;

// vscode severity codes for different diagnostics
const err = 0;
const warn = 1;
const info = 2;
const hint = 3;

/**
 * Updates diagnostic listener to toggle the "while coding" SFX feature
 * @param context
 */
export function updateDiagnosticsListener(context: vscode.ExtensionContext) {
  if (diagnosticListener) {
    diagnosticListener.dispose();
    diagnosticListener = undefined;
  }

  if (whileCodingSFX) {
    // listens for diagnostics while coding; triggers sounds accordingly
    diagnosticListener = vscode.languages.onDidChangeDiagnostics(() => {
      const diagnostics: [vscode.Uri, vscode.Diagnostic[]][] =
        vscode.languages.getDiagnostics();
      while (diagnostics.length > 0) {
        let diag = diagnostics.pop();
        if (diag !== undefined) {
          let diagArray: vscode.Diagnostic[] = diag[1]; //array of diagnostics (diag[0] = uri)
          diagArray.forEach((item: vscode.Diagnostic) => {
            if (item.severity === err) {
              const filePath: string = path.join(
                context.extensionPath,
                "sfx",
                "notification-beep.mp3"
              );
              sound.play(filePath);
            }
            if (item.severity === warn) {
              const filePath: string = path.join(
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
  }
}
