import {
  DirEntry,
  readDir,
  create as createFile,
  mkdir,
} from "@tauri-apps/plugin-fs";
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
  None
}

const FileTreeContext = createContext<{
  create: Accessor<{ root: string; kind: EntryCreateKind } | null>;
  createElement: Accessor<HTMLElement | null>;
  setCreateElement: Setter<HTMLElement | null>;
  cancelCreate: () => void;
  createName: Accessor<string>;
  setCreateName: Setter<string>;
}>();
const useFileTreeContext = () => useContext(FileTreeContext)!;

export function FileTree(props: {
  root: string;
  handleFileClick: (root: string, entry: DirEntry) => void;
  create: Accessor<{ root: string; kind: EntryCreateKind } | null>;
  cancelCreate: () => void;
}) {
  const [createElement, setCreateElement] = createSignal<HTMLElement | null>(
    null,
  );
  const [createName, setCreateName] = createSignal("");
  const isCreating = () => props.create()?.root === props.root && props.create()?.kind !== EntryCreateKind.None;

  onMount(() => {
    const handleClick = (e: MouseEvent) => {
      if (!createElement()) return;
      if (!createElement()!.contains(e.target as Node)) {
        const params = props.create() as {
          root: string;
          kind: EntryCreateKind;
        };
        setCreateElement(null);
        const name = createName();
        setCreateName("");
        switch (params.kind) {
          case EntryCreateKind.Note:
            createFile(params.root + "/" + name + ".note").then(async (file) => {
              await file.close();
              props.cancelCreate();
            });
            break;
          case EntryCreateKind.Dir:
            mkdir(params.root + "/" + name);
            props.cancelCreate();
            break;
        }
      }
    };

    window.addEventListener("click", handleClick);

    onCleanup(() => window.removeEventListener("click", handleClick));
  });

  return (
    <FileTreeContext.Provider
      value={{
        create: props.create,
        cancelCreate: props.cancelCreate,
        createElement,
        setCreateElement,
        createName,
        setCreateName,
      }}
    >
      <EntryList
        handleFileClick={props.handleFileClick}
        root={props.root}
        level={0}
      />
      {isCreating() ? <EntryListCreateItem level={0} /> : null}
    </FileTreeContext.Provider>
  );
}

export function EntryList(props: {
  root: string;
  handleFileClick: (root: string, entry: DirEntry) => void;
  level: number;
}) {
  const [contents, { refetch }] = createResource(
    props.root,
    async (path) => await readDir(path),
  );
  const { create } = useFileTreeContext();

  createEffect<{
    root: string;
    kind: EntryCreateKind;
  } | null>((prev) => {
    const updated = create();
    if (updated === prev || updated !== null || prev === null) return updated;

    if (prev.root === props.root) {
      refetch();
    }

    return updated;
  }, create());

  return (
    <>
      {contents() ?
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
        : null}
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
  const [isCreating, setIsCreating] = createSignal(false);
  const { create } = useFileTreeContext();

  function handleEntryClick() {
    if (props.entry.isFile)
      return props.handleFileClick(props.root, props.entry);
    setIsExpanded((prev) => !prev);
  }

  createEffect(() => {
    if (!create()) return setIsCreating(false);
    const createInfo = create()!;
    if (createInfo.root !== props.root + "/" + props.entry.name) return;
    if (create()?.kind === EntryCreateKind.None) return;

    setIsExpanded(true);
    setIsCreating(true);
  });

  return (
    <>
      <button
        class="flex items-center gap-2 px-2 h-8 text-sm text-base-content/30 cursor-pointer hover:text-base-content/50 w-full hover:bg-base-content/10 rounded-md"
        style={{ "margin-left": `${props.level * 24}px` }}
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
      {isExpanded() ? (
        <EntryList
          root={props.root + "/" + props.entry.name}
          handleFileClick={props.handleFileClick}
          level={props.level + 1}
        />
      ) : null}
      {isCreating() ? <EntryListCreateItem level={props.level + 1} /> : null}
    </>
  );
}

export function EntryListCreateItem(props: { level: number }) {
  const {
    setCreateElement,
    createElement,
    createName: currentName,
    setCreateName: setCurrentName,
  } = useFileTreeContext();

  createEffect(() => {
    if (createElement())
      (createElement()!.children[0] as HTMLInputElement | null)?.focus();
  });

  return (
    <div
      class="w-full px-2"
      ref={setCreateElement}
      style={{ "margin-left": `${props.level * 24}px` }}
    >
      <input
        class="text-sm w-full h-8 outline-none"
        autocomplete="off"
        autocorrect="off"
        value={currentName()}
        onInput={(e) => setCurrentName(e.currentTarget.value)}
      />
    </div>
  );
}
