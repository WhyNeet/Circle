import {
  defaultValueCtx,
  Editor,
  editorViewOptionsCtx,
  rootCtx,
} from "@milkdown/kit/core";
import { onCleanup, onMount } from "solid-js";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import "@milkdown/kit/prose/view/style/prosemirror.css";
import { nord } from "@milkdown/theme-nord";
import { listener } from "@milkdown/kit/plugin/listener";
import { placeholderCtx, placeholder as placeholderPlugin } from "./editor/plugins/placeholder";

export function LexicalEditor({
  placeholder = "Type here...",
  initialMarkdown,
  onEditorInit,
}: {
  placeholder?: string;
  initialMarkdown?: string;
  onEditorInit: (instance: Editor) => void;
}) {
  let editorRef: HTMLDivElement = null!;

  let editor: Editor = null!;

  onMount(async () => {
    // Create the editor instance
    editor = await Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, editorRef);
        if (initialMarkdown) ctx.set(defaultValueCtx, initialMarkdown);

        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          attributes: {
            class: "milkdown-editor h-full min-h-fit w-full outline-none",
            spellcheck: "false",
            autocorrect: "off",
            autocapitalize: "off"
          },
        }));

        ctx.update(placeholderCtx, () => placeholder);
      })
      .config(nord)
      .use(commonmark)
      .use(listener)
      .use(placeholderPlugin)
      .create();

    onEditorInit(editor);
  });

  onCleanup(() => {
    editor.destroy();
  });

  return <div class="h-full w-full" ref={editorRef} />;
}
