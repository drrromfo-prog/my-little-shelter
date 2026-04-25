# Implementation Plan

Near-term plan:

1. Stabilize the simplified information architecture
   - keep homepage clear
   - avoid reintroducing clutter into secondary pages

2. Continue low-risk mobile refinement
   - tighten title scale
   - improve toolbar stacking
   - keep primary action easy to reach

3. Reduce frontend monolith risk
   - gradually split `public/script.js` into clearer modules or sections
   - do this only if it does not disrupt existing API behavior

4. Decide whether presentation-only fields should become persisted
   - `accentColor`
   - `favorite`
   - `revisit`
   - `notesCount`

5. Keep deployment stable
   - preserve GitHub -> Railway auto deploy flow
   - avoid changes that threaten SQLite volume persistence
