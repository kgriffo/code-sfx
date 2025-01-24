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
exports.toggleWhileCodingSFX = toggleWhileCodingSFX;
exports.playSFX = playSFX;
exports.getTerminalOutput = getTerminalOutput;
exports.whileCodingSFX = whileCodingSFX;
const path_1 = __importDefault(require("path"));
const sound_play_1 = __importDefault(require("sound-play"));
const vscode = __importStar(require("vscode"));
// function variables
exports.isWhileCodingSFX = true;
// vscode severity codes for different diagnostics
const err = 0;
const warn = 1;
const info = 2;
const hint = 3;
// functions
/**
 * Toggles "while coding" sfx feature
 */
function toggleWhileCodingSFX() {
    exports.isWhileCodingSFX = !exports.isWhileCodingSFX;
}
// incomplete. the goal is to make a mutable SFX function
function playSFX(context, soundName) {
    soundName = "";
    let sfxFolder = "sfx";
    const filePath = path_1.default.join(context.extensionPath, sfxFolder, soundName);
    sound_play_1.default.play(filePath);
}
/**
 * Grabs terminal output and plays sfx accordingly
 * @param context - file context
 */
async function getTerminalOutput(context) {
    //clears terminal
    vscode.commands.executeCommand("workbench.action.terminal.clear");
    //run program here
    //selects terminal data
    await vscode.commands.executeCommand("workbench.action.terminal.selectAll");
    //copies terminal data
    await vscode.commands.executeCommand("workbench.action.terminal.copySelection");
    //saves terminal data
    const output = await vscode.env.clipboard.readText();
    //console.log(output);
    //const cleanOutput: string = output.trim();
    //console.log(cleanOutput);
    //pastes saved data back into terminal
    //vscode.window.activeTerminal?.sendText(cleanOutput, false);
    if (output.includes("Error")) {
        const filePath = path_1.default.join(context.extensionPath, "sfx", "doorbell.mp3");
        sound_play_1.default.play(filePath);
        vscode.commands.executeCommand("workbench.action.terminal.clearSelection");
    }
    else {
        const filePath = path_1.default.join(context.extensionPath, "sfx", "iphone-chime.mp3");
        sound_play_1.default.play(filePath);
    }
    vscode.commands.executeCommand("workbench.action.terminal.clearSelection");
}
/**
 * Updates diagnostic listener and handles the "while coding" SFX feature
 * @param context - file context
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