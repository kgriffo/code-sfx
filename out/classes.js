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
exports.CommandButtonsProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Defines tree view of CodeSFX command buttons
 */
class CommandButtonsProvider {
    constructor() { }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        const activeLanguage = //for use later... maybe
         vscode.window.activeTextEditor?.document.languageId;
        return [
            new CommandButton("Run with CodeSFX", "codesfx.runWithCodeSFX", "Runs active file with CodeSFX", new vscode.ThemeIcon("debug-start")),
            new CommandButton("Toggle SFX", "codesfx.toggleWhileCodingSFX", "Toggles SFX that play while coding", new vscode.ThemeIcon("debug-stop")),
        ];
    }
}
exports.CommandButtonsProvider = CommandButtonsProvider;
/**
 * Defines buttons for CodeSFX commands
 */
class CommandButton extends vscode.TreeItem {
    constructor(label, commandId, tooltip, icon) {
        super(label);
        this.command = {
            command: commandId,
            title: label,
        };
        this.tooltip = tooltip || "";
        this.iconPath = icon || new vscode.ThemeIcon("play-circle");
    }
}
//# sourceMappingURL=classes.js.map