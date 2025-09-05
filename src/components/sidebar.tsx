import { Space } from "../lib/state";
import { DirEntry, stat, remove } from "@tauri-apps/plugin-fs";
import { createSignal, Resource } from "solid-js";
import { EntryCreateKind, FileTree } from "./file-tree";
import { ContextMenu, ContextMenuButton } from "./ui/context-menu";
import { rsplitOnce } from "../lib/util";
import { useNavigate } from "@solidjs/router";

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
  const [createInfo, setCreateInfo] = createSignal<{
    root: string;
    kind: EntryCreateKind;
  } | null>(null);
  const navigate = useNavigate();

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
    setCreateInfo({ root: rootPath, kind: EntryCreateKind.Note });
  }

  async function handleCreateFolder() {
    const rawPath = contextMenuSelection() ?? props.currentSpace()!.path;
    const entry = await stat(rawPath);
    const rootPath = entry.isFile ? rsplitOnce(rawPath, "/")[1] : rawPath;
    setContextMenuPosition(null);
    setCreateInfo({ root: rootPath, kind: EntryCreateKind.Dir });
  }

  async function handleDelete() {
    const rawPath = contextMenuSelection();
    if (!rawPath) return;
    const root = rsplitOnce(rawPath, "/")[1];
    await remove(rawPath);
    setContextMenuPosition(null);
    setCreateInfo({ root, kind: EntryCreateKind.None });
    setCreateInfo(null);
  }

  return (
    <aside
      class={`border-r border-r-black/10 dark:border-r-black/50 after:absolute after:right-0 after:inset-y-0 after:w-[5px] after:opacity-5 relative pt-[52px] ${props.isOpen ? "w-2xs" : "w-0"} transition-all overflow-hidden`}
    >
      <div
        class={`min-w-2xs w-full transition-all ${props.isOpen ? "opacity-100" : "opacity-0"} p-5 pt-0 ${contextMenuPosition() ? "overflow-hidden" : "overflow-scroll"} h-full`}
        onContextMenu={handleContextMenu}
      >
        {props.currentSpace.loading ? null : (
          <FileTree
            root={props.currentSpace()!.path}
            handleFileClick={handleFileClick}
            create={createInfo}
            cancelCreate={() => setCreateInfo(null)}
          />
        )}
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
