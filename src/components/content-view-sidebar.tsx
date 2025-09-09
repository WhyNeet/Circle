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
          <ArticleOutline outline={props.outline} />
        </div>
      </div>
    </aside>
  );
}

export function ArticleOutline(props: { outline: Accessor<OutlineUnit[]> }) {
  function getClass(level: number): string {
    switch (level) {
      case 1: return "text-base-content font-bold my-2";
      case 2: return "text-sm mb-1 text-base-content/70 pl-4";
      default: return "text-xs text-base-content/50 hover:text-base-content/70 pl-4";
    }
  }

  return <ul>
    {props.outline().map((unit) => (
      <li
        class={`cursor-pointer flex gap-4 ${getClass(unit.level)}`}
        onClick={() => {
          document
            .getElementById(unit.id)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      >
        {/*{unit.level > 2 ? <span class="h-5 w-[1px] bg-base-content/30" /> : null}*/}
        {unit.text}
      </li>
    ))}
  </ul>;
}
