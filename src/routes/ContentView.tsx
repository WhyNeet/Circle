import { useParams } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
import { MarkdownEditor } from "../components/editor";
import PanelRightIcon from "lucide-solid/icons/panel-right";
import { Editor, editorViewCtx } from "@milkdown/kit/core";
import { listenerCtx } from "@milkdown/kit/plugin/listener";
import { getMarkdown, outline } from "@milkdown/kit/utils";
import { ContentViewSidebar } from "../components/content-view-sidebar";

export type OutlineUnit = { text: string; level: number; id: string; };

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
  const [docOutline, setDocOutline] = createSignal<OutlineUnit[]>([]);
  const [isUnsaved, setIsUnsaved] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);

  createEffect(() => {
    path();
    setIsUnsaved(false);
  });

  function onEditorInit(editor: Editor) {
    editorRef = editor;
    editor.ctx.get(listenerCtx).updated(() => {
      setIsUnsaved(true);
      setDocOutline(editor.action(outline()));
      updateHeading();
    });

    setDocOutline(editor.action(outline()));

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
    <main class="h-screen w-full cursor-default flex overflow-hidden">
      <header class="absolute inset-x-0 top-0 z-50 pointer-events-none flex items-center justify-end h-[52px] px-5">
        <button
          class="relative pointer-events-auto cursor-pointer after:-z-10 after:absolute after:-inset-1 after:rounded-md hover:after:bg-base-content/5 text-neutral-600 dark:text-neutral-400 active:after:bg-base-content/10 active:brightness-50 dark:active:brightness-150 z-50"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <PanelRightIcon class="h-5 w-5 stroke-[1.7px]" />
        </button>
      </header>
      <div class="h-full w-full relative">
        <header
          data-tauri-drag-region
          class="absolute inset-x-0 top-0 h-[52px] flex items-center bg-base-200/80 backdrop-blur-lg border-b border-b-black/10 dark:border-b-black/30 z-40 px-5"
        >
          <div class="flex-1 pointer-events-none"></div>
          <div class="text-sm text-base-content/50 w-fit z-50 relative flex items-center pointer-events-none">
            {name()}
          </div>
          <div class="flex-1">
          </div>
        </header>
        <div class="px-10 pt-16 h-full w-full overflow-y-scroll bg-base-200">
          <div class="max-w-4xl mx-auto min-h-fit h-full">
            {rawContents.loading ? null : (
              <MarkdownEditor
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
      </div>
      <ContentViewSidebar isOpen={sidebarOpen()} outline={docOutline} />
    </main>
  );
}
