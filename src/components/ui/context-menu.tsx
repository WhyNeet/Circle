import { Accessor, JSXElement, onCleanup, onMount, JSX } from "solid-js";

export function ContextMenu(props: {
  children?: JSXElement;
  position: Accessor<[number, number] | null>;
  hide: () => void;
}) {
  let contextMenuRef: HTMLDivElement = null!;

  onMount(() => {
    const handleWindowClick = (e: MouseEvent) => {
      if (!contextMenuRef) return;
      if (
        contextMenuRef.contains(e.target as Node) ||
        contextMenuRef === e.target
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      props.hide();
    };

    window.addEventListener("click", handleWindowClick);

    onCleanup(() => window.removeEventListener("click", handleWindowClick));
  });

  return (
    <>
      {props.position() ? (
        <div
          ref={contextMenuRef}
          class="absolute bg-base-200 p-0.5 rounded-md border border-base-300 w-3xs z-50 shadow-lg"
          style={{
            left: `${props.position()![0]}px`,
            top: `${props.position()![1]}px`,
          }}
        >
          {props.children}
        </div>
      ) : null}
    </>
  );
}

export function ContextMenuButton({
  children,
  class: className,
  ...props
}: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      class={`text-sm px-1.5 py-1 w-full flex items-center gap-1.5 cursor-pointer hover:bg-base-300 text-base-content rounded-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
