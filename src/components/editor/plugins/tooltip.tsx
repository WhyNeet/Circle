import { tooltipFactory, TooltipProvider } from "@milkdown/kit/plugin/tooltip";
import { PluginView, TextSelection } from "@milkdown/kit/prose/state";
import { render } from "solid-js/web";
import BoldIcon from "lucide-solid/icons/bold";
import ItalicIcon from "lucide-solid/icons/italic";
import SpaceIcon from "lucide-solid/icons/space";
import StrikethroughIcon from "lucide-solid/icons/strikethrough";
import {
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,
} from "@milkdown/kit/preset/commonmark";
import { Ctx } from "@milkdown/kit/ctx";
import { editorCtx, editorViewCtx } from "@milkdown/kit/core";
import { callCommand } from "@milkdown/kit/utils";
import { toggleStrikethroughCommand } from "@milkdown/kit/preset/gfm";

export const tooltip = tooltipFactory("my-tooltip");

function TooltipComponent(props: { ctx: Ctx }) {
  const tooltipElements = [
    {
      name: "Bold",
      icon: BoldIcon,
      command: toggleStrongCommand,
    },
    {
      name: "Italic",
      icon: ItalicIcon,
      command: toggleEmphasisCommand,
    },
    {
      name: "Strikethrough",
      icon: StrikethroughIcon,
      command: toggleStrikethroughCommand,
    },
    {
      name: "Monospace",
      icon: SpaceIcon,
      command: toggleInlineCodeCommand,
    },
  ];

  return (
    <div class="rounded-md bg-base-200/80 backdrop-blur-lg shadow-lg border border-base-300 flex items-center overflow-hidden p-0.5">
      {tooltipElements.map((item) => (
        <button
          onClick={() => {
            const editor = props.ctx.get(editorCtx);

            editor.action((ctx) => {
              const view = ctx.get(editorViewCtx);
              const { from, to } = view.state.selection;

              const storedFrom = from;
              const storedTo = to;

              const success = callCommand(item.command.key)(ctx);

              if (success) {
                Promise.resolve().then(() => {
                  const currentView = ctx.get(editorViewCtx);
                  if (currentView) {
                    const newState = currentView.state;
                    try {
                      const newSelection = TextSelection.create(newState.doc, storedFrom, storedTo);
                      const tr = newState.tr.setSelection(newSelection);
                      currentView.dispatch(tr);
                    } catch (e) {
                      currentView.dispatch(
                        newState.tr.setSelection(
                          TextSelection.near(newState.doc.resolve(storedFrom))
                        )
                      );
                    }
                    currentView.focus();
                  }
                });
              }
            });
          }}
          class="aspect-square cursor-pointer p-2 hover:bg-base-300 rounded-sm"
        >
          <item.icon class="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function tooltipPluginView(ctx: Ctx): PluginView {
  const container = document.createElement("div");
  container.className = "tooltip-wrapper";
  const dispose = render(() => <TooltipComponent ctx={ctx} />, container);

  const provider = new TooltipProvider({
    content: container,
    debounce: 0,
    shouldShow: (view) => !view.state.selection.empty
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
