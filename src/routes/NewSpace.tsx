import { createEffect, createSignal } from "solid-js";
import ArrowRightIcon from "lucide-solid/icons/arrow-right";
import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import { Loader } from "../components/ui/loader";
import { desktopDir } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppContext } from "../lib/state";
import { useNavigate, useSearchParams } from "@solidjs/router";

export default function NewSpace() {
  const { appData } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [spaceColor, setSpaceColor] = createSignal<string | null>(null);
  const [spaceName, setSpaceName] = createSignal("");
  const [isCreating, setIsCreating] = createSignal(false);
  const [locationError, setLocationError] = createSignal<string | null>(null);
  const [location, setLocation] = createSignal("");
  const fullLocation = () =>
    location() +
    "/" +
    (spaceName().trim().length
      ? spaceName().trim().replace(" ", "-").toLowerCase()
      : "my-new-space");

  desktopDir().then((dir) => setLocation(dir));

  function handleInput(e: InputEvent) {
    setSpaceName((e.currentTarget as HTMLInputElement).value);
  }

  createEffect(() => {
    if (!spaceName().length) return setSpaceColor(null);
    const random = () => Math.round(Math.random() * 255);
    setSpaceColor(`rgb(${random()}, ${random()}, ${random()})`);
  });

  createEffect(() => {
    exists(fullLocation()).then((exists) => {
      if (exists) setLocationError("Folder already exists.");
      else setLocationError(null);
    });
  });

  async function handleCreateClick() {
    if (!appData() || !spaceColor() || locationError()) return;
    const location = fullLocation();
    setIsCreating(true);
    if (await exists(location)) {
      setIsCreating(false);
      return;
    }
    await mkdir(location, { recursive: true });
    await appData()!.createSpace(spaceName(), location, spaceColor()!);
    navigate("/");
  }

  async function handleLocationClick() {
    const selection = await open({
      multiple: false,
      directory: true,
      canCreateDirectories: true,
      title: "Space Location",
      recursive: true,
    });

    if (!selection) return;
    setLocation(selection);
  }

  return (
    <main class="h-screen w-screen bg-base-200 flex" data-tauri-drag-region>
      <button
        class="fixed top-4 left-4 h-8 w-8 rounded-md cursor-pointer text-base-content flex items-center justify-center"
        onClick={() => navigate((searchParams["from"] as string) ?? "/")}
      >
        <ChevronLeftIcon class="h-5 w-5" />
      </button>
      <div class="flex items-center justify-center flex-col text-center pointer-events-none bg-base-300 px-10 w-96">
        <div
          class={`h-20 w-20 rounded-full mb-10 ${spaceColor() ? "" : "border border-base-content/30 border-dashed"}`}
          style={{ background: spaceColor() ?? "transparent" }}
        />
        <h1 class="font-bold text-2xl mb-2 text-base-content">
          Create your space
        </h1>
        <p class="text-sm text-base-content/70 mb-6">
          Spaces help you organize notes and resources for different areas of
          your life.
        </p>
      </div>
      <div class="flex items-center justify-center flex-col pointer-events-none px-10">
        <label
          class="text-xs text-base-content/50 w-full pointer-events-auto"
          for="space-name"
        >
          Space Name
        </label>
        <input
          id="space-name"
          class="outline-none mb-10 w-full pointer-events-auto text-base-content"
          placeholder="My New Space"
          value={spaceName()}
          onInput={handleInput}
          disabled={isCreating()}
          autocomplete="off"
          autocorrect="off"
        />
        <button
          class="w-full text-left pointer-events-auto group"
          disabled={isCreating()}
          onClick={handleLocationClick}
        >
          <label class="text-xs text-base-content/50 w-full">Location</label>
          <div class="cursor-pointer group-disabled:cursor-default text-base-content">
            {fullLocation()}
          </div>
          {locationError() ? (
            <p class="text-error text-xs">{locationError()}</p>
          ) : null}
        </button>
        <button
          disabled={!spaceName().trim().length || isCreating()}
          onClick={() => handleCreateClick()}
          class="px-4 py-2 rounded-full bg-accent text-accent-content text-sm cursor-pointer disabled:cursor-default disabled:opacity-70 flex items-center group transition-opacity pointer-events-auto absolute bottom-10 right-10"
        >
          {isCreating() ? (
            <Loader class="h-5 w-5" />
          ) : (
            <>
              {" "}
              Create
              <div class="transition-all will-change-transform opacity-0 group-hover:opacity-100 w-0 group-hover:w-4 ml-0 group-hover:ml-2 group-disabled:hidden">
                <ArrowRightIcon class="h-4 w-4" />
              </div>{" "}
            </>
          )}
        </button>
      </div>
    </main>
  );
}
