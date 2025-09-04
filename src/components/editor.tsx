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
import {
  placeholderCtx,
  placeholder as placeholderPlugin,
} from "./editor/plugins/placeholder";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { cursor } from "@milkdown/kit/plugin/cursor";
import { history, historyKeymap } from "@milkdown/kit/plugin/history";
import { indent } from "@milkdown/kit/plugin/indent";

export function LexicalEditor({
  placeholder = "Type here...",
  initialMarkdown,
  onEditorInit,
  class: className
}: {
  placeholder?: string;
  initialMarkdown?: string;
  onEditorInit: (instance: Editor) => void;
  class: string
}) {
  let ref: HTMLDivElement = null!;
  let editor: Editor = null!;

  onMount(async () => {
    // Create the editor instance
    editor = await Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, ref);
        if (initialMarkdown) ctx.set(defaultValueCtx, initialMarkdown);

        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          attributes: {
            class: "milkdown-editor h-full min-h-fit w-full outline-none",
            spellcheck: "false",
            autocorrect: "off",
            autocapitalize: "off",
          },
        }));

        ctx.set(placeholderCtx, placeholder);

        ctx.set(historyKeymap.key, {
          Undo: {
            shortcuts: "Mod-z",
          },
          Redo: {
            shortcuts: ["Mod-y", "Shift-Mod-z"],
          },
        });
      })
      .config(nord)
      .use(commonmark)
      .use(listener)
      .use(clipboard)
      .use(cursor)
      .use(history)
      .use(indent)
      .use(placeholderPlugin)
      .create();

    onEditorInit(editor);
  });

  onCleanup(() => {
    editor.destroy();
  });

  return <div class={className} ref={ref} />;
}
