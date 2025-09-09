import { Accessor } from "solid-js";
import { OutlineUnit } from "../routes/ContentView";

export function ContentViewSidebar(props: {
  isOpen: boolean;
  outline: Accessor<OutlineUnit[]>;
}) {
  return (
    <aside
      class={`border-l after:absolute after:rotate-180 after:left-0 after:inset-y-0 after:w-[5px] relative ${props.isOpen ? "w-2xs border-l-black/10 dark:border-l-black/50 after:opacity-5" : "w-0 border-l-0 after:opacity-0"} transition-all`}
    >
      <div
        class={`min-w-2xs w-full transition-all ${props.isOpen ? "opacity-100" : "opacity-0"} h-full`}
      >
        <div
          data-tauri-drag-region
          class="w-full h-[52px] flex items-center px-5"
        >
          <h1 class="text-sm font-bold text-base-content">Note</h1>
        </div>
        <div class="p-5">
          <h2 class="text-xs font-bold text-base-content/30 mb-2">Outline</h2>
          <ul>
            {props.outline().map((unit) => (
              <li
                class="text-base-content/50 text-sm hover:text-base-content/70 cursor-pointer flex gap-4"
                onClick={() => {
                  document
                    .getElementById(unit.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                {Array(unit.level - 1)
                  .fill(0)
                  .map(() => (
                    <span class="h-5 w-[1px] bg-base-content/30" />
                  ))}
                {unit.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
