import { checkpointAccountSwitch } from "./account-switch";
import { activateLocalProfile, validateProfileTarget } from "./local-profiles";
import { profileSwitchWork } from "./profile-switch-work";

export async function switchProfileSafely(id: string) {
  await profileSwitchWork.run(async () => {
    await validateProfileTarget(id);
    const [
      { checkpointLibraryForProfileSwitch, releaseLibraryForProfileSwitch, useLibrary },
      { catalogWriter },
    ] = await Promise.all([import("./videos/store"), import("./videos/persist")]);
    await checkpointAccountSwitch(
      checkpointLibraryForProfileSwitch,
      async () => catalogWriter,
      () =>
        activateLocalProfile(
          id,
          () => {
            profileSwitchWork.assertIdle();
            const current = useLibrary.getState();
            if (
              current.remoteBusy ||
              current.refreshing ||
              current.scanning ||
              catalogWriter.current()
            )
              throw Error(
                "The library started new work. Your current profile was kept; try again when it finishes.",
              );
          },
          releaseLibraryForProfileSwitch,
        ),
    );
  });
}
