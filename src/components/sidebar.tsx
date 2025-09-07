import { Space } from "../lib/state";
import { DirEntry, stat, remove } from "@tauri-apps/plugin-fs";
import { createSignal, Resource } from "solid-js";
import { EntryCreateKind, FileTree, FileTreeRef } from "./file-tree";
import { ContextMenu, ContextMenuButton } from "./ui/context-menu";
import { rsplitOnce } from "../lib/util";
import { useNavigate, useParams } from "@solidjs/router";

export function Sidebar(props: {
  isOpen: boolean;
  currentSpace: Resource<Space>;
}) {
  const [contextMenuPosition, setContextMenuPosition] = createSignal<
    [number, number] | null
  >(null);
  const [contextMenuSelection, setContextMenuSelection] = createSignal<
    string | null
  >(null);
  const navigate = useNavigate();
  const params = useParams();
  const [fileTreeRef, setFileTreeRef] = createSignal<FileTreeRef>(null!);


  function handleFileClick(root: string, entry: DirEntry) {
    const path = encodeURIComponent(`${root}/${entry.name}`);
    navigate(`/app/${path}`);
  }

  function handleContextMenu(
    e: PointerEvent & {
      currentTarget: HTMLDivElement;
      target: Element;
    },
  ) {
    setContextMenuPosition([e.clientX, e.clientY]);
    setContextMenuSelection(e.target.getAttribute("data-path") ?? props.currentSpace()!.path);
  }

  async function handleCreateNote() {
    const rawPath = contextMenuSelection() ?? props.currentSpace()!.path;
    const entry = await stat(rawPath);
    const rootPath = entry.isFile ? rsplitOnce(rawPath, "/")[1] : rawPath;
    setContextMenuPosition(null);
    fileTreeRef().showCreateInput(rootPath, EntryCreateKind.Note);
  }

  async function handleCreateFolder() {
    const rawPath = contextMenuSelection() ?? props.currentSpace()!.path;
    const entry = await stat(rawPath);
    const rootPath = entry.isFile ? rsplitOnce(rawPath, "/")[1] : rawPath;
    setContextMenuPosition(null);
    fileTreeRef().showCreateInput(rootPath, EntryCreateKind.Dir);
  }

  async function handleDelete() {
    const rawPath = contextMenuSelection();
    if (!rawPath) return;
    const root = rsplitOnce(rawPath, "/")[1];
    if (decodeURIComponent(params["path"]) === rawPath) navigate("/app");
    await remove(rawPath, { recursive: true });
    setContextMenuPosition(null);
    fileTreeRef().refresh(root);
  }

  return (
    <aside
      class={`border-r after:absolute after:right-0 after:inset-y-0 after:w-[5px] relative pt-[52px] ${props.isOpen ? "w-3xs border-r-black/10 dark:border-r-black/50 after:opacity-5" : "w-0 border-r-transparent after:opacity-0"} transition-all`}
    >
      <div
        class={`min-w-3xs w-full transition-all ${props.isOpen ? "opacity-100" : "opacity-0"} ${contextMenuPosition() ? "overflow-hidden" : "overflow-auto"} pt-0 h-full`}
        onContextMenu={handleContextMenu}
      >
        <div class="pl-3 inline-block w-full">
          {props.currentSpace.loading ? null : (
            <FileTree
              root={props.currentSpace()!.path}
              handleFileClick={handleFileClick}
              ref={setFileTreeRef}
            />
          )}
        </div>
      </div>
      <ContextMenu
        position={contextMenuPosition}
        hide={() => setContextMenuPosition(null)}
      >
        <ContextMenuButton onClick={handleCreateNote}>
          New Note
        </ContextMenuButton>
        <ContextMenuButton onClick={handleCreateFolder}>
          New Folder
        </ContextMenuButton>
        <ContextMenuButton onClick={handleDelete}>
          Delete
        </ContextMenuButton>
      </ContextMenu>
    </aside>
  );
}
