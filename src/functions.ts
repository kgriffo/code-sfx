import path from "path";
import sound from "sound-play";
import * as vscode from "vscode";

// function variables
export let isWhileCodingSFX: boolean = true;
export let diagnosticListener: vscode.Disposable | undefined;
// vscode severity codes for different diagnostics
const err = 0;
const warn = 1;
const info = 2;
const hint = 3;

// functions
/**
 * Toggles "while coding" sfx feature
 */
export function toggleWhileCodingSFX() {
  isWhileCodingSFX = !isWhileCodingSFX;
}

// incomplete. the goal is to make a mutable SFX function
export function playSFX(context: vscode.ExtensionContext, soundName: string) {
  soundName = "";
  let sfxFolder: string = "sfx";
  const filePath = path.join(context.extensionPath, sfxFolder, soundName);
  sound.play(filePath);
}

/**
 * Grabs terminal output and plays sfx accordingly
 * @param context - file context
 */
export async function getTerminalOutput(context: vscode.ExtensionContext) {
  //clears terminal
  vscode.commands.executeCommand("workbench.action.terminal.clear");
  //run program here
  //selects terminal data
  await vscode.commands.executeCommand("workbench.action.terminal.selectAll");
  //copies terminal data
  await vscode.commands.executeCommand(
    "workbench.action.terminal.copySelection"
  );
  //saves terminal data
  const output: string = await vscode.env.clipboard.readText();
  //console.log(output);
  //const cleanOutput: string = output.trim();
  //console.log(cleanOutput);
  //pastes saved data back into terminal
  //vscode.window.activeTerminal?.sendText(cleanOutput, false);

  if (output.includes("Error")) {
    const filePath: string = path.join(
      context.extensionPath,
      "sfx",
      "doorbell.mp3"
    );
    sound.play(filePath);
    vscode.commands.executeCommand("workbench.action.terminal.clearSelection");
  } else {
    const filePath: string = path.join(
      context.extensionPath,
      "sfx",
      "iphone-chime.mp3"
    );
    sound.play(filePath);
  }
  vscode.commands.executeCommand("workbench.action.terminal.clearSelection");
}

/**
 * Updates diagnostic listener and handles the "while coding" SFX feature
 * @param context - file context
 */
export function whileCodingSFX(context: vscode.ExtensionContext) {
  if (diagnosticListener) {
    diagnosticListener.dispose();
    diagnosticListener = undefined;
  }

  if (isWhileCodingSFX) {
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
