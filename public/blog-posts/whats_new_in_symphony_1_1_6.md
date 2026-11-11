*I'm thrilled to announce another mid-cycle update that has finally opened the floodgates for a more powerful Symphony. Consider this a TLC update that improves QoL across the board, and sets the platform up for new features to be finally added!*

## Improved User Experience
We've made some significant improvements to the UX of Symphony, enabled by the new UI Engine (explained below) as well as features that were overdue. These include:
- Smooth scrolling in the grid
- Contrast improvements to enhance UI legibility
- Better status indication of what tool you're using at any given time
- Resize handles + mouse resize-indication on the edges of selected notes (finally)
- Adaptive window resizing
Individually, they seem small, but altogether they help the creation of music in Symphony feel much more polished and modern, and the app more stable and reliable. 

## UI Engine Overhaul
Over a methodical rewrite of the entire UI engine, we've constructed an entirely new, far more advanced UI engine that still exists on top of the real-time graphics library we've always used -- but this time, it's the most sophisticated and performant it's ever been, utilizing advanced optimizations and a layered, hierarchical structure to implement a basic Document-Object Model (DOM) / Flexbox engine. This allows us to make elements have styling, alignment, connected via data dependency, watch for changes to defer updates, etc. In the upcoming 1.2 update, we'll need every tool in our arsenal to add panels, modals, collapsed/expanded view, and much more, and the previous UI engine was just not sophisticated enough to do the job. Now that the framework has been rewritten, we wanted to essentially re-release the feature-complete alternative to 1.1.5, plus all the other small tweaks, so you'd have access to this new UI as soon as possible!

## Improved Audio Normalization
We received feedback from users that various instruments had wildly different *perceived loudness* -- we upgraded the audio normalization to fix this, so you can layer the provided instruments without certain ones dominating the layering.

## Critical Bug Fixes (3)
> ⚠️ We found that when exporting certain Symphony projects to musicxml, we encountered a recurring bug pertaining to stacked notes and their corresponding chords, which led to irregular measure lengths; we've fixed this system in the new musicxml-exporting logic.

> ⚠️ We also found that when loading projects made in a newer or incompatible version of Symphony, our reader would immediately begin reading/editing the contents before performing some preliminary checks; in 1.1.6 (and beyond), loading incompatible or newer files will flag your attention, urge you to upgrade, and NOT edit the original files' contents.

> ⚠️ Lastly, we found many bugs regarding the state of dropdowns in the app; scrolling content beneath them would cause them to be cut off or hidden, dropdowns with related state had data confounding issues, and responsiveness was poor (in all interactive elements, but especially dropdowns). These have been fixed.

---

Overall, as you may have inferred, these features aren't as flashy as what's to come; but in order to design the complexities of custom instruments, effects, layering, and so on, several critical architectural overhauls had to be made -- that's what 1.1.6 is for. We hope you enjoy the improvements it brings, and that you're excited for what's next!