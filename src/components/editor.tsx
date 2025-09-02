import { onMount } from "solid-js";
import {
  createEditor,
  TextNode,
  ParagraphNode,
  LexicalEditor as LexicalEditorInstance
} from "lexical";
import { mergeRegister } from '@lexical/utils';
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { registerDragonSupport } from "@lexical/dragon";
import { $canShowPlaceholder } from "@lexical/text";

const initialConfig = {
  namespace: 'Circle Editor',
  nodes: [HeadingNode, QuoteNode, TextNode, ParagraphNode],
  onError: (error: Error) => {
    throw error;
  },
  theme: {
    quote: 'PlaygroundEditorTheme__quote',
  },
};

export function LexicalEditor({ placeholder = "Type here..." }: { placeholder?: string }) {
  let editorRef: HTMLDivElement = null!;

  let editor: LexicalEditorInstance = null!;

  function updateState() {
    editor.read(() => {
      if ($canShowPlaceholder(false)) editorRef.setAttribute("placeholder", placeholder);
      else editorRef.removeAttribute("placeholder");
    });
  }

  onMount(() => {
    // Create the editor instance
    editor = createEditor(initialConfig);
    editor.setRootElement(editorRef);

    mergeRegister(
      registerRichText(editor),
      registerDragonSupport(editor),
      registerHistory(editor, createEmptyHistoryState(), 300),
    );

    updateState();

    editor.registerUpdateListener(() => {
      updateState();
    });
  });

  return <div class="lexical-editor outline-none" contentEditable ref={editorRef} />
}
