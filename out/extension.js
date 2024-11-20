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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const sound_play_1 = __importDefault(require("sound-play"));
const path_1 = __importDefault(require("path"));
function activate(context) {
    console.log("CodeSFX is now active!");
    //vscode severity codes for different diagnostics
    const err = 0;
    const warn = 1;
    const info = 2;
    const hint = 3;
    vscode.languages.onDidChangeDiagnostics((event) => {
        const diagnostics = vscode.languages.getDiagnostics();
        while (diagnostics.length > 0) {
            let diag = diagnostics.pop();
            if (diag != undefined) {
                let diagArray = diag[1]; //array of diagnostics (diag[0] = uri)
                diagArray.forEach((item) => {
                    if (item.severity === err) {
                        const filePath = path_1.default.join(context.extensionPath, "sfx", "airplane-beep.mp3");
                        sound_play_1.default.play(filePath);
                    }
                    else if (item.severity === warn) {
                        const filePath = path_1.default.join(context.extensionPath, "sfx", "notification-beep.mp3");
                        sound_play_1.default.play(filePath);
                    }
                });
            }
        }
    });
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/* export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "codesfx" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('codesfx.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from CodeSFX!');
        const path = require("path");
        const sound = require('sound-play');
        const filePath = path.join(context.extensionPath, 'sfx', 'vine-boom-sound-meme.mp3');
        sound.play(filePath);
    });

    context.subscriptions.push(disposable);
} */
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map