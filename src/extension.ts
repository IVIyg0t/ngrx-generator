'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ngrx-action-generator" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.actionGenerator', () => {
        // The code you place here will be executed every time your command is executed
        let actions = new CreateActions();
        actions.getHighlightedTest();
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);
}

export class CreateActions {
    hText: String;
    lineRegx = new RegExp('(export const [A-Z].*;)', 'g');
    // actionRegx = new RegExp('([A-Z]{1,}_[A-Z]{1,})', 'g');
    actionRegx = new RegExp('[A-Z]+(_[A-Z]*)+');
    getHighlightedTest() {
        const editor = vscode.window.activeTextEditor;
        const actions = new Array<any>();
        if (editor.selections) {
            console.log(editor.selections);
            console.log(editor.document.getText())
            // console.log(this.lineRegx.exec(editor.document.getText()));
            let l;
            do {
                l = this.lineRegx.exec(editor.document.getText());
                if (l) {
                    const a = this.actionRegx.exec(l[1]);
                    actions.push(a[0]);
                }
            } while (l);

            editor.edit( (builder) => {
                const sLine = new vscode.Position(editor.selection.anchor.line + 1, 0);
                // console.log(new vscode.Position(editor.selection.anchor.line + 1, 0));
                // buildClasses(actions);
                builder.insert(sLine, this.buildClasses(actions));

            });
        }
    }

    buildClasses(actions: any[]) {
        let strA = new Array<string>();
        actions.forEach( action => {
            this.actionToUpperCase(action);
            strA.push(
`
export class ${this.actionToUpperCase(action)} implements Action {
    readonly type = ${action};

    constructor(public payload?) {}
}
`          );
        });
        let str = strA.join('\n');
        str = str + '\n' + this.buildExportType(actions);
        return str;
    }

    buildExportType(actions: any[]) {
        let str = 'export type Actions\n'
        actions.forEach((action, i) => {
            if (i === 0) {
                let str2 = `    = ${this.actionToUpperCase(action)}\n`
                str = str + str2;
            } else if (i === actions.length - 1) {
                let str2 = `    | ${this.actionToUpperCase(action)};`
                str = str + str2;
            } else {
                let str2 = `    | ${this.actionToUpperCase(action)}\n`
                str = str + str2;
            }
        });
        return str;
    }

    actionToUpperCase(action: string) {
        let str = action.split('_');
        str = str.map( (a) => {
            return a.toLowerCase();
        })
        .map( (a) => {
            return a[0].toUpperCase() + a.substr(1);
        });
        return str.join('');
    }
}


// this method is called when your extension is deactivated
export function deactivate() {
}

