import { useParams } from "@solidjs/router";
import {
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
import { LexicalEditor } from "../components/editor";
import { Editor, editorViewCtx } from "@milkdown/kit/core";
import { listenerCtx } from "@milkdown/kit/plugin/listener";
import { getMarkdown } from "@milkdown/kit/utils";

export default function ContentView() {
  const params = useParams();
  const path = createMemo(() => {
    return decodeURIComponent(params["path"] as string);
  });
  const [name, setName] = createSignal("Untitled");
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
    editor.ctx.get(listenerCtx).updated(() => {
      setIsUnsaved(true);
      updateHeading();
    });

    function updateHeading() {
      const headingCandidate =
        editor.ctx.get(editorViewCtx).state.doc.firstChild;
      if (!headingCandidate) return setName("Untitled");
      if (
        headingCandidate.type.name === "heading" &&
        headingCandidate.attrs["level"] === 1
      )
        setName(
          headingCandidate.textContent.length
            ? headingCandidate.textContent
            : "Untitled",
        );
      else setName("Untitled");
    }

    editor.action(() => {
      updateHeading();
    });
  }

  onMount(() => {
    const saveHandler = async () => {
      if (!isUnsaved()) return;
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
  });

  return (
    <main class="h-screen w-full flex-col gap-4 cursor-default bg-base-200">
      <header class="absolute inset-x-0 top-0 h-[52px] flex items-center pointer-events-none bg-base-200/80 backdrop-blur-lg border-b border-b-black/10 dark:border-b-black/30 z-40">
        <div class="flex-1"></div>
        <div class="text-sm text-base-content/50 w-fit z-50 relative flex items-center">
          {name()}
        </div>
        <div class="flex-1"></div>
      </header>
      <div class="px-10 pt-16 h-full overflow-y-scroll">
        <div class="max-w-4xl mx-auto min-h-fit h-full">
          {rawContents.loading ? null : (
            <LexicalEditor
              initialMarkdown={rawContents()}
              onEditorInit={onEditorInit}
              class="min-h-fit h-full w-full pb-10"
            />
          )}
        </div>
      </div>
      <footer class="absolute inset-x-0 bottom-0 h-8 z-40 bg-base-200/80 backdrop-blur-lg border-t border-t-black/10 dark:border-t-black/30 flex items-center px-5">
        <div class="flex items-center gap-2">
          <div
            class={`h-2 w-2 rounded-full ${isUnsaved() ? "bg-error" : "bg-accent"}`}
          ></div>
          <div class="text-xs text-base-content/70">
            {isUnsaved() ? "Unsaved" : "Saved"}
          </div>
        </div>
      </footer>
    </main>
  );
}
