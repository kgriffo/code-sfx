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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const classes_1 = require("./classes");
const functions_1 = require("./functions");
// activation function
function activate(context) {
    console.log("CodeSFX is now active!");
    // readies "while coding" SFX feature
    (0, functions_1.whileCodingSFX)(context);
    // command disposables
    let runWithCodeSFXDisp = vscode.commands.registerCommand("codesfx.runWithCodeSFX", () => {
        (0, functions_1.runWithCodeSFX)(context);
    });
    let toggleWhileCodingSFXDisp = vscode.commands.registerCommand("codesfx.toggleWhileCodingSFX", () => {
        (0, functions_1.toggleWhileCodingSFX)();
        (0, functions_1.whileCodingSFX)(context);
        if (functions_1.isWhileCodingSFX) {
            vscode.window.showInformationMessage("SFX toggled on");
        }
        if (!functions_1.isWhileCodingSFX) {
            vscode.window.showInformationMessage("SFX toggled off");
        }
    });
    // register the Tree Data Provider
    const commandButtonsProvider = new classes_1.CommandButtonsProvider();
    vscode.window.createTreeView("codesfx", {
        treeDataProvider: commandButtonsProvider,
    });
    context.subscriptions.push(runWithCodeSFXDisp, toggleWhileCodingSFXDisp);
}
// deactivates extension \\
function deactivate() { }
//# sourceMappingURL=extension.js.map