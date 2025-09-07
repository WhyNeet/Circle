import { create, DirEntry, mkdir, readDir } from "@tauri-apps/plugin-fs";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import {
  Accessor,
  createContext,
  createEffect,
  createResource,
  createSignal,
  For,
  onCleanup,
  onMount,
  Setter,
  useContext,
} from "solid-js";

export enum EntryCreateKind {
  Note,
  Dir,
}

export interface FileTreeContext {
  createInfo: Accessor<{
    prefix: string;
    kind: EntryCreateKind;
    setName: Setter<string>;
  } | null>;
  refresh: Accessor<string>;
  setSelectedFile: Setter<string | null>;
  selectedFile: Accessor<string | null>;
}

export interface FileTreeRef {
  showCreateInput: (prefix: string, kind: EntryCreateKind) => void;
  refresh: (prefix: string) => void;
  selectFile: (path: string) => void;
}

const FileTreeContext = createContext<FileTreeContext>();
const useFileTreeContext = () => useContext(FileTreeContext)!;

export function FileTree(props: {
  root: string;
  handleFileClick: (root: string, entry: DirEntry) => void;
  ref?: (ref: FileTreeRef) => void;
}) {
  const [createInfo, setCreateInfo] =
    createSignal<ReturnType<FileTreeContext["createInfo"]>>(null);
  const [currentName, setCurrentName] = createSignal("");
  const [refresh, setRefresh] = createSignal("", { equals: () => false });
  const [selectedFile, setSelectedFile] = createSignal<string | null>(null);

  const fileTreeRef: FileTreeRef = {
    showCreateInput: (prefix, kind) => {
      setCreateInfo({ prefix, kind, setName: setCurrentName });
    },
    refresh: (prefix) => setRefresh(prefix),
    selectFile: (path) => setSelectedFile(path),
  };

  onMount(() => {
    props.ref?.(fileTreeRef);

    const windowClickHandler = async () => {
      if (!createInfo()) return;

      if (currentName().length) {
        switch (createInfo()!.kind) {
          case EntryCreateKind.Note:
            await create(`${createInfo()!.prefix}/${currentName()}.md`);
            break;
          case EntryCreateKind.Dir:
            await mkdir(`${createInfo()!.prefix}/${currentName()}`);
            break;
        }
        setRefresh(createInfo()!.prefix);
      }
      setCreateInfo(null);
      setCurrentName("");
    };
    window.addEventListener("mousedown", windowClickHandler);

    onCleanup(() => {
      window.removeEventListener("mousedown", windowClickHandler);
    });
  });

  return (
    <FileTreeContext.Provider
      value={{ createInfo, refresh, selectedFile, setSelectedFile }}
    >
      <EntryList
        handleFileClick={props.handleFileClick}
        root={props.root}
        level={0}
      />
    </FileTreeContext.Provider>
  );
}

export function EntryList(props: {
  root: string;
  handleFileClick: (root: string, entry: DirEntry) => void;
  level: number;
}) {
  const { createInfo, refresh } = useFileTreeContext();
  const isCreating = () => createInfo()?.prefix === props.root;
  const [contents, { refetch }] = createResource(
    props.root,
    async (path) => await readDir(path),
  );
  let inputRef: HTMLInputElement = null!;

  createEffect(() => {
    if (isCreating()) inputRef.focus();
  });

  createEffect(() => {
    if (refresh() === props.root) refetch();
  });

  return (
    <>
      {contents() ? (
        <For each={contents()!.filter((entry) => !entry.name.startsWith("."))}>
          {(entry) => (
            <EntryListItem
              root={props.root}
              entry={entry}
              handleFileClick={props.handleFileClick}
              level={props.level}
            />
          )}
        </For>
      ) : null}
      {isCreating() ? (
        <input
          onMouseDown={(e) => e.stopPropagation()}
          class="outline-none text-sm text-base-content h-8 px-2"
          ref={inputRef}
          onInput={(e) => createInfo()!.setName(e.currentTarget.value)}
          style={{ "margin-left": `${props.level * 24}px` }}
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
        />
      ) : null}
    </>
  );
}

export function EntryListItem(props: {
  root: string;
  entry: DirEntry;
  handleFileClick: (root: string, entry: DirEntry) => void;
  level: number;
}) {
  const { createInfo, selectedFile, setSelectedFile } = useFileTreeContext();
  const isSelected = () =>
    selectedFile() === `${props.root}/${props.entry.name}`;
  const [isExpanded, setIsExpanded] = createSignal(false);

  function handleEntryClick() {
    if (props.entry.isFile) {
      setSelectedFile(`${props.root}/${props.entry.name}`);
      return props.handleFileClick(props.root, props.entry);
    }
    setIsExpanded((prev) => !prev);
  }

  createEffect(() => {
    if (createInfo()?.prefix === `${props.root}/${props.entry.name}`)
      setIsExpanded(true);
  });

  return (
    <>
      <div class="flex" style={{ width: "calc(256px - 0.75rem)" }}>
        <div style={{ "min-width": `${props.level * 24}px` }} />
        <button
          class={`flex items-center gap-2 px-2 h-8 text-sm cursor-pointer ${isSelected() ? "bg-base-100 text-base-content/50 shadow-lg" : "hover:text-base-content/50 text-base-content/30"} rounded-md min-w-[calc(256px-1.5rem)]`}
          onClick={handleEntryClick}
          data-path={`${props.root}/${props.entry.name}`}
        >
          {props.entry.isDirectory ? (
            <ChevronRightIcon
              class="stroke-2 h-4 w-4"
              style={{ transform: `rotate(${Number(isExpanded()) * 90}deg)` }}
            />
          ) : null}
          {props.entry.name}
        </button>
        <div class="min-w-3"></div>
      </div>
      {isExpanded() ? (
        <EntryList
          root={props.root + "/" + props.entry.name}
          handleFileClick={props.handleFileClick}
          level={props.level + 1}
        />
      ) : null}
    </>
  );
}
