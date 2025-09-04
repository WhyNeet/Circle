import { useNavigate, useParams } from "@solidjs/router";
import { rsplitOnce } from "../lib/util";
import { createMemo, createResource, createSignal, onCleanup, onMount } from "solid-js";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
import { LexicalEditor } from "../components/editor";
import { Editor } from "@milkdown/kit/core";
import { listenerCtx } from "@milkdown/kit/plugin/listener";
import { getMarkdown } from "@milkdown/kit/utils";

export default function ContentView() {
  const params = useParams();
  const navigate = useNavigate();
  const path = createMemo(() => {
    return decodeURIComponent(params["path"] as string);
  });
  const name = createMemo(() => {
    if (!params["path"]) {
      navigate("/app");
      return "";
    }
    return rsplitOnce(rsplitOnce(path(), "/")[0], ".")[1];
  });
  const [rawContents] = createResource(path, async (path) => {
    const contents: Uint8Array = await readFile(path);
    const decoder = new TextDecoder();
    const raw = decoder.decode(contents);
    return raw.length ? raw : undefined;
  });
  let editorRef: Editor = null!;
  const [isUnsaved, setIsUnsaved] = createSignal(false);

  function onEditorInit(editor: Editor) {
    editorRef = editor;
    editor.ctx.get(listenerCtx).markdownUpdated((_, markdown, prevMarkdown) => {
      setIsUnsaved(markdown !== prevMarkdown);
    });
  }

  onMount(() => {
    const saveHandler = async () => {
      setIsUnsaved(false);
      const markdown = editorRef.action(getMarkdown());
      const encoder = new TextEncoder();
      await writeFile(path(), encoder.encode(markdown.toString()));
    };

    window.addEventListener("keydown", (e) => {
      if (e.metaKey && e.key === "s") saveHandler();
    });

    onCleanup(() => {
      window.removeEventListener("keydown", saveHandler);
    });
  })

  return (
    <main class="h-screen w-full flex-col gap-4 cursor-default bg-base-200">
      <header class="absolute inset-x-0 top-0 h-[52px] flex items-center pointer-events-none bg-base-200/80 backdrop-blur-lg border-b border-b-base-content/10 z-40">
        <div class="flex-1"></div>
        <div class="text-sm text-base-content/50 z-50">
          {name()}
          {isUnsaved() ? "*" : ""}
        </div>
        <div class="flex-1"></div>
      </header>
      <div class="px-10 pt-16 h-full overflow-y-scroll">
        <div class="max-w-4xl mx-auto min-h-fit h-full">
          {rawContents.loading ? null : (
            <LexicalEditor
              initialMarkdown={rawContents()}
              onEditorInit={onEditorInit}
            />
          )}
        </div>
      </div>
    </main>
  );
}
