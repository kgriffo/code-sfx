import path from "path";
import sound from "sound-play";
import { spawn } from "child_process";
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
// incomplete. the goal is to make a mutable SFX function
export function playSFX(context: vscode.ExtensionContext, soundName: string) {
  soundName = "";
  let sfxFolder: string = "sfx";
  const filePath = path.join(context.extensionPath, sfxFolder, soundName);
  sound.play(filePath);
}

/**
 * Toggles "while coding" sfx feature
 */
export function toggleWhileCodingSFX() {
  isWhileCodingSFX = !isWhileCodingSFX;
  console.log(`Toggled whileCodingSFX: ${isWhileCodingSFX}`);
}

/**
 * Runs active file with CodeSFX, grabs terminal output and plays sfx accordingly
 * @param context - file context
 */
export async function runWithCodeSFX(context: vscode.ExtensionContext) {
  //clears terminal
  vscode.commands.executeCommand("workbench.action.terminal.clear");
  //run program (only python right now)
  if (vscode.window.activeTextEditor) {
    const scriptPath: string | undefined =
      vscode.window.activeTextEditor?.document.fileName;
    console.log(scriptPath);
    //runs active file
    vscode.window.activeTerminal?.sendText(`python3 ${scriptPath}`);
    //wait (band-aid solution)
    await new Promise((resolve) => setTimeout(resolve, 100));
    //selects terminal data
    await vscode.commands.executeCommand("workbench.action.terminal.selectAll");
    //copies terminal data
    await vscode.commands.executeCommand(
      "workbench.action.terminal.copySelection"
    );
    //saves terminal data
    const output: string = await vscode.env.clipboard.readText();

    if (output.includes("Error")) {
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
      vscode.commands.executeCommand(
        "workbench.action.terminal.clearSelection"
      );
    }
  } else {
    vscode.window.showErrorMessage("Command unavailable - no active file.");
  }
}

/**
 * Handles the "while coding" SFX feature
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
