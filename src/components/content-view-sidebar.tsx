export function ContentViewSidebar(props: { isOpen: boolean }) {
  return (
    <aside
      class={`border-l after:absolute after:rotate-180 after:left-0 after:inset-y-0 after:w-[5px] relative ${props.isOpen ? "w-2xs border-l-black/10 dark:border-l-black/50 after:opacity-5" : "w-0 border-l-0 after:opacity-0"} transition-all`}
    >
      <div
        class={`min-w-2xs w-full transition-all ${props.isOpen ? "opacity-100" : "opacity-0"} h-full`}
      >
        <div data-tauri-drag-region class="w-full h-[52px] flex items-center px-5">
          <h1 class="text-sm font-bold text-base-content">File info</h1>
        </div>
        <div class="p-5">
          <h2 class="text-sm font-bold text-base-content/30 mb-2">Outline</h2>
          <ul>
            {["An h1 heading", "An h2 heading", "An h3 heading"].map((heading) => <li class="text-base-content/50 text-sm hover:text-base-content/70 cursor-pointer">{heading}</li>)}
          </ul>
        </div>
      </div>
    </aside>
  );
}
