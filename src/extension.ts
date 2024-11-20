import * as vscode from "vscode";
import sound from "sound-play";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
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
            const filePath = path.join(
              context.extensionPath,
              "sfx",
              "airplane-beep.mp3"
            );
            sound.play(filePath);
          } else if (item.severity === warn) {
            const filePath = path.join(
              context.extensionPath,
              "sfx",
              "notification-beep.mp3"
            );
            sound.play(filePath);
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
export function deactivate() {}
