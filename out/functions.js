"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineChangeListener = exports.diagnosticListener = exports.isWhileCodingSFX = void 0;
exports.playSFX = playSFX;
exports.toggleWhileCodingSFX = toggleWhileCodingSFX;
exports.whileCodingSFX = whileCodingSFX;
exports.runWithCodeSFX = runWithCodeSFX;
const path_1 = __importDefault(require("path"));
const sound_play_1 = __importDefault(require("sound-play"));
const vscode = __importStar(require("vscode"));
// function variables \\
exports.isWhileCodingSFX = true;
// functions \\
/**
 * Plays sound file
 * @param context - extension context
 * @param soundName - name of sound file
 */
function playSFX(context, soundName) {
    let sfxFolder = "sfx";
    const filePath = path_1.default.join(context.extensionPath, sfxFolder, soundName);
    sound_play_1.default.play(filePath);
}
/**
 * Toggles "while coding" sfx feature
 */
function toggleWhileCodingSFX() {
    exports.isWhileCodingSFX = !exports.isWhileCodingSFX;
    console.log(`Toggled whileCodingSFX: ${exports.isWhileCodingSFX}`);
}
/**
 * Executes the "while coding" SFX feature. "Handling" diagnostics in this context
 * means to play a single sound accordingly
 * @param context - extension context
 */
function whileCodingSFX(context) {
    let allDiags = new Set();
    let handledDiags = new Set();
    let resolvedDiags = [];
    let currentLine = vscode.window.activeTextEditor?.selection.active.line;
    let lineChange = false;
    // ensures diagnostic listener is activated correctly
    if (exports.diagnosticListener) {
        exports.diagnosticListener.dispose();
        exports.diagnosticListener = undefined;
    }
    // ensures line change listener is activated correctly
    if (exports.lineChangeListener) {
        exports.lineChangeListener.dispose();
        exports.lineChangeListener = undefined;
    }
    if (exports.isWhileCodingSFX) {
        // listens for line changes while coding; used to determine whether or not errors have been resolved
        exports.lineChangeListener = vscode.window.onDidChangeTextEditorSelection((event) => {
            console.log("---NEW LOGS---");
            console.log("current line: " + currentLine);
            console.log("handledDiags size = " + handledDiags.size);
            console.log("allDiags size = " + allDiags.size);
            console.log("resolvedDiags size = " + resolvedDiags.length);
            // selections[0].active.line is the line the cursor is on (zero indexed)
            let newLine = event.selections[0].active.line;
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
        });
        // listens for diagnostics while coding; triggers sounds accordingly
        exports.diagnosticListener = vscode.languages.onDidChangeDiagnostics(() => {
            handleDiagnostics();
        });
        /**
         * Plays sounds accordingly for each diagnostic
         */
        function handleDiagnostics() {
            const diagnostics = vscode.languages.getDiagnostics();
            // clear allDiags
            allDiags.clear();
            // populate allDiags
            diagnostics.forEach(([, diagArray]) => {
                diagArray.forEach((item) => {
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
                            playSFX(context, "WhileCodingError.wav");
                            console.log("(While coding) error sound played!");
                            break;
                        // warning
                        case diagID.includes("Severity: 1"):
                            playSFX(context, "WhileCodingWarning.wav");
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
async function runWithCodeSFX(context) {
    // grabs platform (Windows or Mac)
    const platform = process.platform;
    // changes selection color to transparent to prevent visual annoyances
    vscode.workspace
        .getConfiguration()
        .update("workbench.colorCustomizations", { "terminal.selectionBackground": "#00000000" }, vscode.ConfigurationTarget.Global);
    // clears terminal
    vscode.commands.executeCommand("workbench.action.terminal.clear");
    // selects terminal data
    await vscode.commands.executeCommand("workbench.action.terminal.selectAll");
    // copies terminal data
    await vscode.commands.executeCommand("workbench.action.terminal.copySelection");
    // saves terminal command prompt
    let termPrompt = await vscode.env.clipboard.readText();
    console.log("Before substring: " + termPrompt);
    // default to bash
    let endOfPrompt = termPrompt.search("$");
    // change delimiter to % if zsh
    if (platform === "darwin") {
        endOfPrompt = termPrompt.search("%");
    }
    termPrompt = termPrompt.substring(0, endOfPrompt);
    console.log("After substring: " + termPrompt);
    const promptLength = termPrompt.length;
    console.log("Prompt Length: " + promptLength);
    // gathers file information
    if (vscode.window.activeTextEditor) {
        const scriptPath = vscode.window.activeTextEditor?.document.fileName;
        const scriptLanguage = vscode.window.activeTextEditor?.document.languageId;
        console.log("Script path: " + scriptPath);
        console.log("Script language: " + scriptLanguage);
        if (!vscode.window.activeTerminal) {
            const terminal = vscode.window.createTerminal();
            terminal.show();
        }
        else {
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
            let output = await vscode.env.clipboard.readText();
            if (output.includes(termPrompt, promptLength)) {
                clearInterval(interval);
                console.log("Script completed");
                // error detection
                if (output.includes("Error") || //python
                    output.includes("Exception") || //java
                    output.includes("compilation failed") //java
                ) {
                    switch (true) {
                        // divide by zero
                        case output.includes("ZeroDivisionError") || //python
                            output.includes("/ by zero"): //java
                            playSFX(context, "DivideByZero.wav");
                            console.log("Divide by zero sound played!");
                            break;
                        // index out of bounds error
                        case output.includes("IndexError") || //python
                            output.includes("ArrayIndexOutOfBoundsException"): //java
                            playSFX(context, "IndexOutOfBounds.wav");
                            console.log("Index out of bounds error sound played!");
                            break;
                        // type error / cast exception
                        case output.includes("TypeError") || //python
                            output.includes("ClassCastException"): //java
                            playSFX(context, "TypeError.wav");
                            console.log("Type error / cast exception sound played!");
                            break;
                        // stack overflow
                        case output.includes("RecursionError") || //pthon
                            output.includes("StackOverflowError"): //java
                            playSFX(context, "StackOverflow.wav");
                            console.log("Stack overflow sound played!");
                            break;
                        // key error / null pointer exception
                        case output.includes("KeyError") || //python
                            output.includes("NullPointerException"): //java
                            playSFX(context, "KeyError.wav");
                            console.log("Key error / null pointer exception sound played!");
                            break;
                        // value error / number format exception
                        case output.includes("ValueError") || //python
                            output.includes("NumberFormatException"): //java
                            playSFX(context, "ValueError.wav");
                            console.log("Value error / number format exception sound played!");
                            break;
                        // iteration and modification error
                        case output.includes("changed size during iteration") || //python
                            output.includes("ConcurrentModificationException"): //java
                            playSFX(context, "IterationAndModification.wav");
                            console.log("Iteration and modification error sound played!");
                            break;
                        // I/O Error
                        case output.includes("IOError") || //python
                            output.includes("IOException"): //java
                            playSFX(context, "IOError.wav");
                            console.log("I/O error sound played!");
                            break;
                        // invalid import error
                        case output.includes("ModuleNotFoundError") || //python
                            output.includes("ClassNotFoundException"): //java
                            playSFX(context, "InvalidImportError.wav");
                            console.log("Invalid import sound played!");
                            break;
                        // memory error
                        case output.includes("MemoryError") || //python
                            output.includes("OutOfMemoryError"): //java
                            playSFX(context, "MemoryError.wav");
                            console.log("Memory error sound played!");
                            break;
                        // general error
                        default:
                            playSFX(context, "(while_coding_warning)A4_triangle_440hz_0.1s.wav");
                            console.log("General error sound played!");
                    }
                    vscode.workspace
                        .getConfiguration()
                        .update("workbench.colorCustomizations", { "terminal.selectionBackground": "default" }, vscode.ConfigurationTarget.Global);
                    // clears selection
                    vscode.commands.executeCommand("workbench.action.terminal.clearSelection");
                    // no errors
                }
                else {
                    playSFX(context, "(no_errors)A5_sine_880hz_0.1s.wav");
                    console.log("All-clear sound played!");
                    // set selection color back to default
                    vscode.workspace
                        .getConfiguration()
                        .update("workbench.colorCustomizations", { "terminal.selectionBackground": "default" }, vscode.ConfigurationTarget.Global);
                    // clears selection
                    vscode.commands.executeCommand("workbench.action.terminal.clearSelection");
                }
            }
        }, 500);
    }
    else {
        vscode.window.showErrorMessage("Command unavailable - no active file.");
    }
}
//# sourceMappingURL=functions.js.map