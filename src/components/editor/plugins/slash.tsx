import { SlashProvider } from "@milkdown/kit/plugin/slash";
import { EditorState, PluginView } from "@milkdown/kit/prose/state";
import { EditorView } from "@milkdown/kit/prose/view";
import { slashFactory } from "@milkdown/plugin-slash";
import { onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";

export const slash = slashFactory("editor-slash");

function SlashMenu() {
  const functions = [
    {
      name: "Title",
    },
    {
      name: "Heading",
    },
    {
      name: "Code",
    },
  ];

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handler);

    onCleanup(() => {
      window.removeEventListener("keydown", handler);
    });
  });

  return (
    <div class="w-2xs p-1 rounded-md bg-base-200 border border-base-300 shadow-lg absolute slash-menu">
      {functions.map((func) => (
        <button class="w-full p-1 hover:bg-base-300 rounded-md">
          {func.name}
        </button>
      ))}
    </div>
  );
}

export function slashPluginView(): PluginView {
  const container = document.createElement("div");
  container.className = "slash-menu-wrapper";
  const dispose = render(SlashMenu, container);

  const provider = new SlashProvider({
    content: container,
    floatingUIOptions: {
      placement: "bottom",
      strategy: "absolute",
      middleware: [{
        fn: state => {
          const scrollHeight = state.elements.floating.parentElement!.getBoundingClientRect().height;
          const menuHeight = (state.elements.floating.childNodes[0] as HTMLElement).getBoundingClientRect().height;
          if (menuHeight + state.y > scrollHeight) {
            state.y -= menuHeight + 24;
          }
          return {
            ...state
          };
        },
        name: "Placement"
      }]
    },
    debounce: 0,
  });

  const handler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      provider.hide();
    }
  };

  window.addEventListener("keydown", handler);


  return {
    update: (updatedView: EditorView, prevState: EditorState) => {
      provider.update(updatedView, prevState);
    },
    destroy: () => {
      window.removeEventListener("keydown", handler);
      provider.destroy();
      dispose();
      container.remove();
    },
  };
}
