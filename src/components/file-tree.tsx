import {
  DirEntry,
  readDir,
} from "@tauri-apps/plugin-fs";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import {
  createContext,
  createResource,
  createSignal,
  For,
  onMount,
  useContext,
} from "solid-js";

export enum EntryCreateKind {
  Note,
  Dir,
}

export interface FileTreeContext {

}

export interface FileTreeRef {
  showCreateInput: (prefix: string, kind: EntryCreateKind) => void;
}

const FileTreeContext = createContext<FileTreeContext>();
const useFileTreeContext = () => useContext(FileTreeContext)!;

export function FileTree(props: {
  root: string;
  handleFileClick: (root: string, entry: DirEntry) => void;
  ref?: FileTreeRef;
}) {
  const fileTreeRef: FileTreeRef = {
    showCreateInput: (prefix, kind) => { },
  };

  onMount(() => {
    props.ref = fileTreeRef;
  });

  return (
    <FileTreeContext.Provider value={{}}>
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
  const [contents, { }] = createResource(
    props.root,
    async (path) => await readDir(path),
  );

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
    </>
  );
}

export function EntryListItem(props: {
  root: string;
  entry: DirEntry;
  handleFileClick: (root: string, entry: DirEntry) => void;
  level: number;
}) {
  const [isExpanded, setIsExpanded] = createSignal(false);

  function handleEntryClick() {
    if (props.entry.isFile)
      return props.handleFileClick(props.root, props.entry);
    setIsExpanded((prev) => !prev);
  }

  return (
    <>
      <div class="flex" style={{ width: "calc(256px - 0.75rem)" }}>
        <div style={{ "min-width": `${props.level * 24}px` }} />
        <button
          class="flex items-center gap-2 px-2 h-8 text-sm text-base-content/30 cursor-pointer hover:text-base-content/50 hover:bg-base-content/10 rounded-md min-w-[calc(256px-1.5rem)]"
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
      ) : null
      }
    </>
  );
}
