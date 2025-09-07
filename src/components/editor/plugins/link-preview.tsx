import { tooltipFactory, TooltipProvider } from "@milkdown/kit/plugin/tooltip";
import { PluginView, Selection } from "@milkdown/kit/prose/state";
import { EditorView } from "@milkdown/kit/prose/view";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Accessor, createMemo, createSignal } from "solid-js";
import { render } from "solid-js/web";
import PencilIcon from "lucide-solid/icons/pencil";
import CheckIcon from "lucide-solid/icons/check";

export const linkTooltip = tooltipFactory("link-tooltip");

function TooltipComponent(props: {
  view: EditorView;
  selection: Accessor<Selection>;
}) {
  const [editedLink, setEditedLink] = createSignal<string | null>(null);
  let inputRef: HTMLSpanElement = null!;
  const url = createMemo(() => {
    return getCurrentLink(props.selection());
  });

  function getCurrentLink(selection: Selection) {
    if (!selection) return "";

    const { $from } = selection;
    const marks = $from.marks();

    const linkMark = marks.find((mark) => mark.type.name === "link");
    const url = linkMark?.attrs["href"];

    return url;
  }

  function editLink(newUrl: string) {
    const { state, dispatch } = props.view;
    const { selection, doc } = state;
    const { $from } = selection;

    // Find the link mark
    const marks = $from.marks();
    const linkMark = marks.find((mark) => mark.type.name === "link");

    if (!linkMark) return false;

    let startPos = $from.pos;
    let endPos = $from.pos;

    // Walk backwards to find the start of this marked text
    for (let pos = $from.pos; pos > $from.start(); pos--) {
      const resolved = doc.resolve(pos - 1);
      const nodeMarks = resolved.marks();
      const hasLink = nodeMarks.some(
        (mark) =>
          mark.type.name === "link" && mark.attrs.href === linkMark.attrs.href,
      );

      if (!hasLink) {
        startPos = pos;
        break;
      }
      if (pos - 1 <= $from.start()) {
        startPos = $from.start();
        break;
      }
    }

    // Walk forwards to find the end of this marked text
    for (let pos = $from.pos; pos < $from.end(); pos++) {
      const resolved = doc.resolve(pos);
      const nodeMarks = resolved.marks();
      const hasLink = nodeMarks.some(
        (mark) =>
          mark.type.name === "link" && mark.attrs.href === linkMark.attrs.href,
      );

      if (!hasLink) {
        endPos = pos;
        break;
      }
      if (pos >= $from.end()) {
        endPos = $from.end();
        break;
      }
    }

    const tr = state.tr
      .removeMark(startPos, endPos - 1, linkMark)
      .addMark(
        startPos,
        endPos - 1,
        linkMark.type.create({ ...linkMark.attrs, href: newUrl }),
      );
    dispatch(tr);
  }

  return (
    <div class="rounded-md bg-base-200/80 backdrop-blur-lg shadow-lg border border-base-300 overflow-hidden px-3 py-1.5 flex items-center gap-2">
      {editedLink() === null ? (
        <>
          <button
            class="cursor-pointer text-sm text-primary"
            onClick={() => openUrl(url())}
          >
            {url()}
          </button>
          <button onClick={() => setEditedLink(url())} class="cursor-pointer">
            <PencilIcon class="h-4 text-base-content/50" />
          </button>
        </>
      ) : (
        <>
          <span
            class="outline-none text-sm w-full cursor-text"
            onInput={(e) => setEditedLink(e.currentTarget.innerText)}
            role="textbox"
            ref={inputRef}
            contenteditable
          >
            {url()!}
          </span>
          <button
            onClick={() => {
              editLink(editedLink()!);
              setEditedLink(null);
            }}
            class="cursor-pointer"
          >
            <CheckIcon class="h-4 text-base-content/50" />
          </button>
        </>
      )}
    </div>
  );
}

export function linkTooltipPluginView(view: EditorView): PluginView {
  const container = document.createElement("div");
  container.className = "tooltip-wrapper";
  const [selection, setSelection] = createSignal<Selection>(null!);
  const dispose = render(
    () => <TooltipComponent view={view} selection={selection} />,
    container,
  );

  const provider = new TooltipProvider({
    content: container,
    debounce: 0,
    shouldShow: (view) => {
      if (!view.state.selection.empty) return false;
      const { $from } = view.state.selection;
      if (!!$from.marks().find((mark) => mark.type.name === "link")) {
        setSelection(view.state.selection);
        return true;
      }

      return false;
    },
  });

  return {
    update: (updatedView, prevState) => {
      provider.update(updatedView, prevState);
    },
    destroy: () => {
      provider.destroy();
      dispose();
      container.remove();
    },
  };
}
