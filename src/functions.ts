import path from "path";
import sound from "sound-play";
import * as vscode from "vscode";

// function variables \\
export let isWhileCodingSFX: boolean = true;
export let diagnosticListener: vscode.Disposable | undefined;
export let lineChangeListener: vscode.Disposable | undefined;

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
        console.log("---NEW LOGS---");
        console.log("current line: " + currentLine);
        console.log("handledDiags size = " + handledDiags.size);
        console.log("allDiags size = " + allDiags.size);
        console.log("resolvedDiags size = " + resolvedDiags.length);
        // selections[0].active.line is the line the cursor is on (zero indexed)
        let newLine: number = event.selections[0].active.line;
        // line didn't change
        if (newLine === currentLine) {
          lineChange = false;
        }
        // line changed
        if (newLine !== currentLine) {
          console.log("new line: " + newLine);
          // set lineChange flag to true (user changed line)
          lineChange = true;
          // set updated currentLine
          currentLine = newLine;

          // handle diagnostics
          handleDiagnostics();
        }
        console.log("lineChange = " + lineChange);
      }
    );

    // listens for diagnostics while coding; triggers sounds accordingly
    diagnosticListener = vscode.languages.onDidChangeDiagnostics(() => {
      handleDiagnostics();
    });

    /**
     * Plays sounds accordingly for each diagnostic
     */
    function handleDiagnostics() {
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

      // check for handled and resolved diagnostics
      handledDiags.forEach((diagID) => {
        console.log("checking for handled and resolved");
        if (!allDiags.has(diagID)) {
          resolvedDiags.push(diagID);
        }
      });

      // remove resolved diagnostics from handledDiags so that if the same diagnostic reoccurs,
      // it will be handled correctly
      resolvedDiags.forEach((diagID) => {
        console.log("removing resolved");
        handledDiags.delete(diagID);
      });

      // clear resolvedDiags
      resolvedDiags = [];

      if (!lineChange) {
        return;
      }

      // handle diagnostics
      allDiags.forEach((diagID) => {
        // play sound
        if (lineChange && !handledDiags.has(diagID)) {
          switch (true) {
            // error
            case diagID.includes("Severity: 0"):
              playSFX(
                context,
                "(while_coding_error)A4_sawtooth_440hz_0.1s.wav"
              );
              console.log("(While coding) error sound played!");
              break;

            // warning
            case diagID.includes("Severity: 1"):
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
              console.log("(While coding) warning sound played!");
              break;
          }

          // add handled diagnostic to handledDiags
          handledDiags.add(diagID);
        }
      });
    }
  }
}

/**
 * Runs active file with CodeSFX, grabs terminal output and plays sfx accordingly
 * @param context - extension context
 */
export async function runWithCodeSFX(context: vscode.ExtensionContext) {
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
        // error detection
        if (
          output.includes("Error") || //python
          output.includes("Exception") //java
        ) {
          switch (true) {
            // divide by zero
            case output.includes("ZeroDivisionError") || //python
              output.includes("/ by zero"): //java
              playSFX(context, "(DivideByZero)G5(ish)_sawtooth_800hz_0.1s.wav");
              console.log("Divide by zero sound played!");
              break;

            // index out of bounds error
            case output.includes("IndexError") || //python
              output.includes("ArrayIndexOutOfBoundsException"): //java
              playSFX(context, "(IndexError)B4(ish)_sawtooth_500hz_0.1s.wav");
              console.log("Index out of bounds error sound played!");
              break;

            // type error / cast exception
            case output.includes("TypeError") || //python
              output.includes("ClassCastException"): //java
              playSFX(context, "(TypeError)D5(ish)_sawtooth_600hz_0.1s.wav");
              console.log("Type error / cast exception sound played!");
              break;

            // stack overflow
            case output.includes("RecursionError") || //pthon
              output.includes("StackOverflowError"): //java
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
              console.log("Stack overflow sound played!");
              break;

            // attribute error / null pointer exception
            case output.includes("AttributeError") || //python
              output.includes("NullPointerException"): //java
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
              console.log(
                "Attribute error / null pointer exception sound played!"
              );
              break;

            // value error / number format exception
            case output.includes("ValueError") || //python
              output.includes("NumberFormatException"): //java
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
              console.log(
                "Value error / number format exception sound played!"
              );
              break;

            // iteration and modification error
            case output.includes("changed size during iteration") || //python
              output.includes("ConcurrentModificationException"): //java
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
              console.log("Iteration and modification error sound played!");
              break;

            // I/O Error
            case output.includes("IOError") || //python
              output.includes("IOException"): //java
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
              console.log("I/O error sound played!");
              break;

            // invalid import error
            case output.includes("ModuleNotFoundError") || //python
              output.includes("ClassNotFoundException"): //java
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
              console.log("Invalid import sound played!");
              break;

            // memory error
            case output.includes("MemoryError") || //python
              output.includes("OutOfMemoryError"): //java
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
              console.log("Memory error sound played!");
              break;

            // general error
            default:
              playSFX(
                context,
                "(while_coding_warning)A4_triangle_440hz_0.1s.wav"
              );
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
          playSFX(context, "(no_errors)A5_sine_880hz_0.1s.wav");
          console.log("All-clear sound played!");

          // set selection color back to default
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
