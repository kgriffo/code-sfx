import path from "path";
import sound from "sound-play";
import * as vscode from "vscode";

// function variables \\
export let isWhileCodingSFX: boolean = true;
export let diagnosticListener: vscode.Disposable | undefined;
export let lineChangeListener: vscode.Disposable | undefined;
// vscode severity codes for different diagnostics \\
const err = 0;
const warn = 1;

// functions \\
/**
 * Plays sound file
 * @param context - extension context
 * @param soundName - name of sound file
 */
export function playSFX(context: vscode.ExtensionContext, soundName: string) {
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
 * Executes the "while coding" SFX feature. "Handling" diagnostics in this context
 * means to play a single sound accordingly
 * @param context - extension context
 */
export function whileCodingSFX(context: vscode.ExtensionContext) {
  let allDiags: Set<string> = new Set<string>();
  let handledDiags: Set<string> = new Set<string>();
  let resolvedDiags: string[] = [];
  let currentLine: number | undefined =
    vscode.window.activeTextEditor?.selection.active.line;
  let lineChange: boolean = false;

  // ensures diagnostic listener is activated correctly
  if (diagnosticListener) {
    diagnosticListener.dispose();
    diagnosticListener = undefined;
  }
  // ensures line change listener is activated correctly
  if (lineChangeListener) {
    lineChangeListener.dispose();
    lineChangeListener = undefined;
  }

  if (isWhileCodingSFX) {
    // listens for line changes while coding; used to determine whether or not errors have been resolved
    lineChangeListener = vscode.window.onDidChangeTextEditorSelection(
      (event) => {
        console.log("current line: " + currentLine);
        // selections[0].active.line is the line the cursor is on (zero indexed)
        let newLine: number = event.selections[0].active.line;
        console.log("new line: " + newLine);
        // line changed
        if (newLine !== currentLine) {
          // clear resolvedDiags
          resolvedDiags = [];
          handledDiags.forEach((diagID) => {
            // diagnostic handled and resolved
            if (!allDiags.has(diagID)) {
              resolvedDiags.push(diagID);
            }
          });
          // remove resolved diagnostics from handledDiags so that if the same diagnostic reoccurs,
          // it will be handled correctly
          for (let diagID of resolvedDiags) {
            handledDiags.delete(diagID);
          }
          lineChange = true;
        }
        currentLine = newLine;
      }
    );

    // listens for diagnostics while coding; triggers sounds accordingly
    diagnosticListener = vscode.languages.onDidChangeDiagnostics(() => {
      const diagnostics: [vscode.Uri, vscode.Diagnostic[]][] =
        vscode.languages.getDiagnostics();

      // clear allDiags
      allDiags.clear();
      // populate allDiags
      diagnostics.forEach(([, diagArray]) => {
        diagArray.forEach((item: vscode.Diagnostic) => {
          let diagID = `Severity: ${item.severity} Start line: ${item.range.start.line} End line: ${item.range.end.line} Message: ${item.message}`;
          allDiags.add(diagID);
        });
      });

      // clear resolvedDiags
      resolvedDiags = [];
      handledDiags.forEach((diagID) => {
        // diagnostic handled and resolved
        if (!allDiags.has(diagID)) {
          resolvedDiags.push(diagID);
        }
      });

      // remove resolved diagnostics from handledDiags so that if the same diagnostic reoccurs,
      // it will be handled correctly
      for (let diagID of resolvedDiags) {
        handledDiags.delete(diagID);
      }

      // handle diagnostics
      diagnostics.forEach(([, diagArray]) => {
        diagArray.forEach((item: vscode.Diagnostic) => {
          let diagID = `Severity: ${item.severity} Start line: ${item.range.start.line} End line: ${item.range.end.line} Message: ${item.message}`;
          if (lineChange && !handledDiags.has(diagID)) {
            console.log("sound should be played");
            // play sound
            // error
            if (item.severity === err) {
              playSFX(
                context,
                "(while_coding_error)A4_sawtooth_440hz_0.1s.wav"
              );
              console.log("(While coding) error sound played!");
            }

            // warning
            if (item.severity === warn) {
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
              console.log("(While coding) warning sound played!");
            }

            // add handled diagnostic to handledDiags
            handledDiags.add(diagID);
            // reset lineChange to false
            lineChange = false;
          }
        });
      });
    });
  }
}

/**
 * Runs active file with CodeSFX, grabs terminal output and plays sfx accordingly
 * @param context - extension context
 */
export async function runWithCodeSFX(context: vscode.ExtensionContext) {
  // keeps track of whether or not error sound has been played (one per run)
  let errorSoundPlayed: boolean = false;
  // grabs platform (Windows or Mac)
  const platform: string = process.platform;
  // changes selection color to transparent to prevent visual annoyances
  vscode.workspace
    .getConfiguration()
    .update(
      "workbench.colorCustomizations",
      { "terminal.selectionBackground": "#00000000" },
      vscode.ConfigurationTarget.Global
    );
  // clears terminal
  vscode.commands.executeCommand("workbench.action.terminal.clear");
  // selects terminal data
  await vscode.commands.executeCommand("workbench.action.terminal.selectAll");
  // copies terminal data
  await vscode.commands.executeCommand(
    "workbench.action.terminal.copySelection"
  );
  // saves terminal command prompt
  let termPrompt: string = await vscode.env.clipboard.readText();
  console.log("Before substring: " + termPrompt);
  // default to bash
  let endOfPrompt: number = termPrompt.search("$");
  // change delimiter to % if zsh
  if (platform === "darwin") {
    endOfPrompt = termPrompt.search("%");
  }
  termPrompt = termPrompt.substring(0, endOfPrompt);
  console.log("After substring: " + termPrompt);
  const promptLength: number = termPrompt.length;
  console.log("Prompt Length: " + promptLength);
  // gathers file information
  if (vscode.window.activeTextEditor) {
    const scriptPath: string | undefined =
      vscode.window.activeTextEditor?.document.fileName;
    const scriptLanguage: string | undefined =
      vscode.window.activeTextEditor?.document.languageId;
    console.log("Script path: " + scriptPath);
    console.log("Script language: " + scriptLanguage);
    if (!vscode.window.activeTerminal) {
      const terminal = vscode.window.createTerminal();
      terminal.show();
    } else {
      vscode.window.activeTerminal.show();
    }
    // runs active file
    if (scriptLanguage === "python") {
      vscode.window.activeTerminal?.sendText(`python3 ${scriptPath}`);
      console.log("Python script ran");
    }
    if (scriptLanguage === "java") {
      vscode.window.activeTerminal?.sendText(`java ${scriptPath}`);
      console.log("Java script ran");
    }

    // check if prompt appears again, signalling script completion
    const interval = setInterval(async () => {
      // selects terminal data
      vscode.commands.executeCommand("workbench.action.terminal.selectAll");
      // copies terminal data
      vscode.commands.executeCommand("workbench.action.terminal.copySelection");
      // saves terminal data
      let output: string = await vscode.env.clipboard.readText();
      if (output.includes(termPrompt, promptLength)) {
        clearInterval(interval);
        console.log("Script completed");
        // error detected (Python first, Java second)
        if (output.includes("Error") || output.includes("Exception")) {
          // divide by zero
          if (
            output.includes("ZeroDivisionError") ||
            output.includes("/ by zero")
          ) {
            const filePath: string = path.join(
              context.extensionPath,
              "sfx",
              "(DivideByZero)G5(ish)_sawtooth_800hz_0.1s.wav"
            );
            sound.play(filePath);
            errorSoundPlayed = true;
            console.log("Divide by zero sound played!");
          }

          // index error (out of bounds)
          if (
            output.includes("IndexError") ||
            output.includes("ArrayIndexOutOfBoundsException")
          ) {
            const filePath: string = path.join(
              context.extensionPath,
              "sfx",
              "(IndexError)B4(ish)_sawtooth_500hz_0.1s.wav"
            );
            sound.play(filePath);
            errorSoundPlayed = true;
            console.log("Index error sound played!");
          }

          // type error (Python only)
          if (output.includes("TypeError")) {
            const filePath: string = path.join(
              context.extensionPath,
              "sfx",
              "(TypeError)D5(ish)_sawtooth_600hz_0.1s.wav"
            );
            sound.play(filePath);
            errorSoundPlayed = true;
            console.log("Type error sound played!");
          }

          // general error
          if (!errorSoundPlayed) {
            const filePath: string = path.join(
              context.extensionPath,
              "sfx",
              "(while_coding_error)A4_sawtooth_440hz_0.1s.wav"
            );
            sound.play(filePath);
            console.log("General error sound played!");
          }

          vscode.workspace
            .getConfiguration()
            .update(
              "workbench.colorCustomizations",
              { "terminal.selectionBackground": "default" },
              vscode.ConfigurationTarget.Global
            );
          // clears selection
          vscode.commands.executeCommand(
            "workbench.action.terminal.clearSelection"
          );
          // no errors
        } else {
          const filePath: string = path.join(
            context.extensionPath,
            "sfx",
            "(no_errors)A5_sine_880hz_0.1s.wav"
          );
          sound.play(filePath);
          console.log("Sound played!");
          vscode.workspace
            .getConfiguration()
            .update(
              "workbench.colorCustomizations",
              { "terminal.selectionBackground": "default" },
              vscode.ConfigurationTarget.Global
            );
          // clears selection
          vscode.commands.executeCommand(
            "workbench.action.terminal.clearSelection"
          );
        }
      }
    }, 500);
  } else {
    vscode.window.showErrorMessage("Command unavailable - no active file.");
  }
}
