import { LexicalEditor } from "./editor";

export function NoteView() {
  return <>
    <header class="h-[52px] absolute top-0 inset-x-0 flex items-center pl-5 pr-2 justify-between z-50 pointer-events-none">
      <div class="flex-1 flex items-center">
      </div>
      <div class="pointer-events-none">
        <div class="text-sm text-base-content/50 hover:text-base-content pointer-events-auto">New Note</div>
      </div>
      <div class="flex-1 pointer-events-none flex items-center justify-end">
      </div>
    </header>
    <div class="h-screen w-full p-5 mx-auto max-w-4xl">
      <LexicalEditor />
    </div>
  </>
}
