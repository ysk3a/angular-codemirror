import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { basicSetup, minimalSetup } from 'codemirror';
// import {EditorView, basicSetup} from "codemirror"

import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { autocompletion, CompletionContext, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxTree, syntaxHighlighting } from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { crosshairCursor, drawSelection, dropCursor, EditorView, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, Tooltip, TooltipView, hoverTooltip, showTooltip, tooltips, rectangularSelection } from '@codemirror/view';

import { Compartment, EditorState, Extension } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { oneDark, oneDarkTheme, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';

//https://voracious.dev/blog/how-to-build-a-code-editor-with-codemirror-6-and-typescript/introduction
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  completions = [
    { label: 'panic', type: 'keyword' },
    { label: 'park', type: 'constant', info: 'Test completion' },
    { label: 'password', type: 'variable' },
  ];
  @ViewChild('myeditor') myEditor: any;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    let myEditorElement = this.myEditor.nativeElement;
    // basicSetup, minimalSetup,
    let myExt: Extension = [basicSetup, java(), oneDark, wordHover, highlightSelectionMatches(), autocompletion({ override: [this.myCompletions, this.myCompletions3] })];
    //     let state: EditorView = new EditorView();

    //     try {
    //       state = EditorState.create({
    //         doc: `
    // // if there is some error do this else that
    // if (something() >= 100.00) {
    //   let myVar = 200;
    //   let myVar2 = "100";
    // } else {
    // // i have another comment
    //   something2.something3();
    // }
    // `,
    //         extensions: myExt,
    //       });
    //     } catch (e) {
    //       //Please make sure install codemirror@6.0.1
    //       //If your command was npm install codemirror, will installed 6.65.1(whatever)
    //       //You will be here.
    //       console.error('custom error msg', e);
    //     }

    //     //console.log(state);

    let view = new EditorView({
      state: EditorState.create({
        doc: `
    // if there is some error do this else that
    if (something() >= 100.00) {
    let myVar = 200;
    let myVar2 = "100";
    } else {
    // i have another comment
    something2.something3();
    }
    `,
        extensions: myExt,
      }),
      parent: myEditorElement,
    });
  }

  myCompletions(context) {
    let before = context.matchBefore(/\w+/);
    // If completion wasn't explicitly started and there
    // is no word before the cursor, don't open completions.
    if (!context.explicit && !before) return null;
    return {
      from: before ? before.from : context.pos,
      options: this.completions,
      validFor: /^\w*$/,
    };
  }
  myCompletions3(context: CompletionContext) {
    let word = context.matchBefore(/\w*/);
    if (word.from == word.to && !context.explicit) return null;
    return {
      from: word.from,
      options: [
        { label: 'match', type: 'keyword' },
        { label: 'hello', type: 'variable', info: '(World)' },
        { label: 'magic', type: 'text', apply: '⠁⭒*.✩.*⭒⠁', detail: 'macro' },
      ],
    };
  }
}
function myCompletions(context: CompletionContext) {
  let word = context.matchBefore(/\w*/);
  if (word.from == word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: [
      { label: 'match', type: 'keyword' },
      { label: 'hello', type: 'variable', info: '(World)' },
      { label: 'magic', type: 'text', apply: '⠁⭒*.✩.*⭒⠁', detail: 'macro' },
    ],
  };
}
export const wordHover = hoverTooltip((view, pos, side) => {
  let { from, to, text } = view.state.doc.lineAt(pos);
  let start = pos;
  let end = pos;

  while (start > from && /\w/.test(text[start - from - 1])) {
    start--;
  }
  while (end < to && /\w/.test(text[end - from])) {
    end++;
  }
  if ((start === pos && side < 0) || (end === pos && side > 0)) {
    return null;
  }

  console.log('hovertooltip', view, pos, side, view.state.doc.slice(start, end));
  return {
    pos: start,
    end,
    above: true,
    create(view) {
      let dom = document.createElement('div');
      dom.textContent = view.state.doc.slice(start, end)[0];
      return { dom };
    },
  };
});
