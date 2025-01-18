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
exports.CommandButtons = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const sound_play_1 = __importDefault(require("sound-play"));
const path_1 = __importDefault(require("path"));
//class definitions for command buttons
class CommandButtons {
    constructor() { }
    onDidChangeTreeData;
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        const activeLanguage = vscode.window.activeTextEditor?.document.languageId;
        return [
            new Button("Get Terminal Output", "codesfx.getTerminalOutput", "Grabs terminal output and plays sound effects", new vscode.ThemeIcon("debug-start")),
        ];
    }
}
exports.CommandButtons = CommandButtons;
class Button extends vscode.TreeItem {
    constructor(label, commandId, tooltip, icon) {
        super(label, vscode.TreeItemCollapsibleState.None); // Buttons are non-collapsible
        this.command = {
            command: commandId,
            title: label,
        };
        this.tooltip = tooltip || "";
        this.iconPath = icon || new vscode.ThemeIcon("play-circle");
    }
}
// functions
// incomplete. the goal is to make a mutable SFX function
function playSFX(context, soundName) {
    soundName = "";
    let sfxFolder = "sfx";
    const filePath = path_1.default.join(context.extensionPath, sfxFolder, soundName);
    sound_play_1.default.play(filePath);
}
function getTerminalOutput(context) {
    vscode.commands
        .executeCommand("workbench.action.terminal.selectAll")
        .then(() => {
        vscode.commands
            .executeCommand("workbench.action.terminal.copySelection")
            .then(async () => {
            let output = vscode.env.clipboard.readText();
            if ((await output).includes("Error")) {
                const filePath = path_1.default.join(context.extensionPath, "sfx", "doorbell.mp3");
                sound_play_1.default.play(filePath);
                vscode.commands.executeCommand("workbench.action.terminal.clearSelection");
            }
            else {
                const filePath = path_1.default.join(context.extensionPath, "sfx", "iphone-chime.mp3");
                sound_play_1.default.play(filePath);
            }
            vscode.commands.executeCommand("workbench.action.terminal.clearSelection");
        });
    });
}
// activation function
function activate(context) {
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
                        setTimeout(() => {
                            const filePath = path_1.default.join(context.extensionPath, "sfx", "notification-beep.mp3");
                            sound_play_1.default.play(filePath);
                        }, 1000);
                    }
                    if (item.severity === warn) {
                        setTimeout(() => {
                            const filePath = path_1.default.join(context.extensionPath, "sfx", "airplane-beep.mp3");
                            sound_play_1.default.play(filePath);
                        }, 1000);
                    }
                });
            }
        }
    });
    // scans terminal output; triggers sounds accordingly
    let disposable = vscode.commands.registerCommand("codesfx.getTerminalOutput", () => {
        getTerminalOutput(context);
    });
    // Register the Tree Data Provider
    const commandButtonsProvider = new CommandButtons();
    vscode.window.createTreeView("codesfx", {
        treeDataProvider: commandButtonsProvider,
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map