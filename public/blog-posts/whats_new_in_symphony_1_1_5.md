*I'm excited to surprise you all with a surprise mid-cycle update that completely transforms Symphony under the hood for the future.*

## Up to 90% Smaller App Footprint

That's not clickbait! By changing the underlying runtime, and removing unnecessary files from the installer, Symphony's overall footprint shrinks from around 700 MB—1.2 GB down all the way to just ~60 MB. That's a best-case reduction in size by **90%** and realistically, the app size shrinks by around **75%** post-installation. The hope here is to reduce installation friction for users that are concerned about disk space.

You'll also see a vastly simpler installation experience — **one file, one click.**

##### The one-click install will also be available for v1.1, but I'd recommend you get 1.1.5 anyway :)

## Over 50% Less RAM Usage

The same runtime jump also reduces the overall RAM usage of the app. By using OS-native rendering (as opposed to Electron's bundled browser), we're shaving off all the overhead; meaning no more unnecessary RAM bloat.

## 3x Faster Project Manager Ops

A small architectural change under the hood changes Symphony's file-based IPC to socket-based, eliminating polling intervals to make all the PM interactions (loading project info, opening projects, exporting, converting, etc.) more than 300% faster on average.

## Better Boot Experience

By using a lightning-fast Rust launcher, there's far less delay in the visual feedback for launching Symphony. Additionally, we're syncing the boot times of both the Project Manager and the Editor, meaning when then PM is up, the editor is too — no more waiting for the Editor to slowly boot after. This Rust launcher brings the boot experience of Symphony on-par with other industry-grade software.

## Development: Better Dev Velocity

The underlying *backend* architecture is shifting from being cross-stack to being more python-centric; namely, the Project Manager's backend (file operation management, etc.) is shifting to a Python core, just like the Editor, which makes development faster while keeping functionality the same. This will allow for shipping features faster in the future, including a potential revamped Editor UI to support instruments/plugins — developed faster than ever thought possible before, and sacrificing none of our original goals with the app.

---

1.1.5 is not a massive user-facing update on it's own, per se, but it's a genuine leap forward in how advanced, efficient, and elegant the system will be for supporting future changes. I can't wait to see what you make!

#### ETA: June 2026

