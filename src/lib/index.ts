import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
// import { Menu, MenuItem, PredefinedMenuItem, Submenu } from "@tauri-apps/api/menu";

export async function init() {
  await (async () => {
    const window = getCurrentWindow();
    const oldSize = await window.outerSize();
    const newSize = new LogicalSize(oldSize.width, oldSize.height + 1);
    await window.setSize(newSize);
    await window.setSize(oldSize);
  })();

  document.addEventListener('keydown', async (e) => {
    if (e.metaKey && e.key === 'm') {
      e.preventDefault();
      await getCurrentWindow().minimize();
    }
  });

  document.addEventListener("contextmenu", (e) => e.preventDefault());


  // const aboutSubmenu = await Submenu.new({
  //   text: "About",
  //   items: [
  //     await PredefinedMenuItem.new({
  //       text: 'Quit',
  //       item: 'Quit',
  //     }),
  //   ],
  // });

  // const fileSubmenu = await Submenu.new({
  //   text: "File",
  //   items: [
  //     await MenuItem.new({
  //       id: "new-file",
  //       text: "New Note",
  //       accelerator: "Cmd+N"
  //     }),
  //   ]
  // });

  // const spacesSubmenu = await Submenu.new({
  //   text: "Spaces",
  //   items: [
  //     await MenuItem.new({
  //       id: "new-space",
  //       text: "New",
  //     }),
  //   ]
  // });

  // const menu = await Menu.new({
  //   items: [aboutSubmenu, fileSubmenu, spacesSubmenu],
  // });

  // menu.setAsAppMenu();

}
