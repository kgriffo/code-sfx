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
exports.diagnosticListener = exports.isWhileCodingSFX = void 0;
exports.playSFX = playSFX;
exports.toggleWhileCodingSFX = toggleWhileCodingSFX;
exports.runWithCodeSFX = runWithCodeSFX;
exports.whileCodingSFX = whileCodingSFX;
const path_1 = __importDefault(require("path"));
const sound_play_1 = __importDefault(require("sound-play"));
const vscode = __importStar(require("vscode"));
// function variables \\
exports.isWhileCodingSFX = true;
// vscode severity codes for different diagnostics \\
const err = 0;
const warn = 1;
const info = 2;
const hint = 3;
// functions \\
// incomplete. the goal is to make a mutable SFX function
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
 * Runs active file with CodeSFX, grabs terminal output and plays sfx accordingly
 * @param context - extension context
 */
async function runWithCodeSFX(context) {
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
    const endOfPrompt = termPrompt.search("%");
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
                if (output.includes("Error") || output.includes("Exception")) {
                    const filePath = path_1.default.join(context.extensionPath, "sfx", "doorbell.mp3");
                    sound_play_1.default.play(filePath);
                    console.log("Sound played!");
                }
                else {
                    const filePath = path_1.default.join(context.extensionPath, "sfx", "iphone-chime.mp3");
                    sound_play_1.default.play(filePath);
                    console.log("Sound played!");
                }
            }
        }, 500);
    }
    else {
        vscode.window.showErrorMessage("Command unavailable - no active file.");
    }
    // clears selection
    vscode.commands.executeCommand("workbench.action.terminal.clearSelection");
    // reverts highlight to default blue color
    // vscode.workspace.getConfiguration().update(
    //   "workbench.colorCustomizations",
    //   { "terminal.selectionBackground": "#00000000" }, //change to default color
    //   vscode.ConfigurationTarget.Global
    // );
}
/**
 * Handles the "while coding" SFX feature
 * @param context - extension context
 */
function whileCodingSFX(context) {
    if (exports.diagnosticListener) {
        exports.diagnosticListener.dispose();
        exports.diagnosticListener = undefined;
    }
    if (exports.isWhileCodingSFX) {
        // listens for diagnostics while coding; triggers sounds accordingly
        exports.diagnosticListener = vscode.languages.onDidChangeDiagnostics(() => {
            const diagnostics = vscode.languages.getDiagnostics();
            while (diagnostics.length > 0) {
                let diag = diagnostics.pop();
                if (diag !== undefined) {
                    let diagArray = diag[1]; //array of diagnostics (diag[0] = uri)
                    diagArray.forEach((item) => {
                        if (item.severity === err) {
                            const filePath = path_1.default.join(context.extensionPath, "sfx", "notification-beep.mp3");
                            sound_play_1.default.play(filePath);
                        }
                        if (item.severity === warn) {
                            const filePath = path_1.default.join(context.extensionPath, "sfx", "airplane-beep.mp3");
                            sound_play_1.default.play(filePath);
                        }
                    });
                }
            }
        });
    }
}
//# sourceMappingURL=functions.js.map