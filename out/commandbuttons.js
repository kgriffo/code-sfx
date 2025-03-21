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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandButtons = void 0;
const vscode = __importStar(require("vscode"));
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
            new Button("Toggle SFX While Coding", "codesfx.toggleWhileCodingSFX", "Toggles SFX that play while coding", new vscode.ThemeIcon("")),
        ];
    }
}
exports.CommandButtons = CommandButtons;
class Button extends vscode.TreeItem {
    constructor(label, commandId, tooltip, icon) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.command = {
            command: commandId,
            title: label,
        };
        this.tooltip = tooltip || "";
        this.iconPath = icon || new vscode.ThemeIcon("play-circle");
    }
}
//# sourceMappingURL=commandbuttons.js.map