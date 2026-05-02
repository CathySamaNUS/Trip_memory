# Return to Taiwan 🗺️

An interactive travel-scrapbook MVP. Click locations on a stylized Taiwan map, walk through a fixed timeline of memories, tap NPCs / animals / objects to trigger narration or dialogue, collect souvenirs, and unlock photo groups in your album.

Built with **React + Vite + Tailwind CSS**. No backend, no login. Progress is saved in `localStorage`.

The story is **not branching**. The player is re-lighting a travel memory that already happened — every tap adds detail, never a fork.

---

## 1. Run the project

```bash
# from the project root
npm install
npm run dev
```

Vite will print a local URL (usually http://localhost:5173). Open it on desktop or mobile — the layout is responsive.

Other scripts:

```bash
npm run build     # production build
npm run preview   # preview the build locally
```

To wipe saved progress, open DevTools → Application → Local Storage and delete the `return_to_taiwan_v2` key (or run `localStorage.clear()` in the console).

---

## 2. Project structure

```
src/
  App.jsx                       # top-level page router + localStorage
  main.jsx
  index.css                     # Tailwind + scrapbook utilities
  data/
    travelData.js               # aggregator + Night Market (short chapter)
    rainyShrineRoute.js         # Rainy Shrine Route (long chapter, 5 parts, 11 events)
  components/
    StartPage.jsx
    MapPage.jsx
    MemoryPage.jsx               # works for short and long chapters
    InventoryPage.jsx
    AlbumPage.jsx
    DialogBox.jsx
    LocationNode.jsx
    ItemCard.jsx
    PhotoGroupCard.jsx           # album cover (cover photo + count)
    PhotoGroupModal.jsx          # carousel + grid view of all photos in a group
```

### Files modified or created in the last refactor

**Created**
- `src/data/rainyShrineRoute.js`
- `src/components/PhotoGroupCard.jsx`
- `src/components/PhotoGroupModal.jsx`

**Replaced (deleted old files)**
- `src/components/CGCard.jsx` → `PhotoGroupCard.jsx`
- `src/components/CGModal.jsx` → `PhotoGroupModal.jsx`

**Modified**
- `src/data/travelData.js` — new schema (parts, photoGroups, array rewards), aggregates rainyShrineRoute.js
- `src/App.jsx` — new progress shape, chapter resume
- `src/components/MemoryPage.jsx` — long-chapter UI, parts, progress bar, action button, inline notifications
- `src/components/AlbumPage.jsx` — photoGroup grid + modal
- `src/components/InventoryPage.jsx` — uses `collectedItemIds` array
- `src/components/MapPage.jsx`, `LocationNode.jsx` — in-progress badge

---

## 3. Replace placeholder images with real travel photos

Photos live inside `photoGroups.<group>.photos[*].imageUrl`. Defaults are `null`, which falls back to a gradient + emoji card.

### Option A — imported assets (recommended; Vite hashes the URL)

```js
// 1. Drop the file at src/assets/photos/auntie_umbrella.jpg
// 2. Inside src/data/rainyShrineRoute.js (or travelData.js):

import auntieUmbrella from '../assets/photos/auntie_umbrella.jpg'

photo('p_auntie_1', 'Auntie with an Umbrella', '...', {
  type: 'main', emoji: '☂️', gradient: 'from-rose-200 to-amber-100',
}),
// then change the photo entry to set imageUrl:
{ ...,
  imageUrl: auntieUmbrella,
}
```

The simplest path is to edit each photo entry directly:

```js
{
  id: 'p_auntie_1',
  title: 'Auntie with an Umbrella',
  caption: '...',
  imageUrl: auntieUmbrella,   // ← replace the null
  type: 'main',
  emoji: '☂️',
  gradient: 'from-rose-200 to-amber-100',
}
```

### Option B — files in `/public`

Drop photos under `public/photos/` and reference them by absolute URL:

```js
imageUrl: '/photos/auntie_umbrella.jpg'
```

### Where else placeholders appear

- `event.backgroundImage` — set this to a path/import to override the gradient scene background on the Memory Page. The `sceneGradient` + `sceneEmoji` are the fallback.
- The Album cover photo for each group is the photo with `type: 'main'` (or the first photo if none is marked main).

---

## 4. Add new locations, events, items, and photoGroups

Everything is data-driven; no hardcoded counts in components.

### Add a new location (short or long chapter)

Either add it to `src/data/travelData.js` directly, or create a new file like `src/data/jiufenStreet.js` and aggregate it.

```js
// src/data/jiufenStreet.js
export const jiufenItems = {
  tea_leaf: { id: 'tea_leaf', name: 'Oolong Tea Leaf', emoji: '🍵', description: '...' },
}

export const jiufenPhotoGroups = {
  jf_tea_house: {
    id: 'jf_tea_house',
    title: 'Tea House',
    caption: 'Steam, rain, and warm wood.',
    photos: [
      { id: 'p_jf_1', title: 'The Window', caption: '...', imageUrl: null,
        type: 'main', emoji: '🍵', gradient: 'from-emerald-200 to-amber-100' },
    ],
  },
}

export const jiufenLocation = {
  id: 'jiufen',
  name: 'Jiufen Old Street',
  emoji: '🏮',
  description: 'Stone steps, tea houses, and rain.',
  pos: { top: '34%', left: '60%' },     // % position on the Taiwan silhouette
  status: 'available',                   // 'locked' | 'available'
  chapterType: 'long',                   // or 'short'
  parts: [
    { id: 'climb', name: 'Climbing the steps' },
    { id: 'tea',   name: 'Hiding from the rain' },
  ],
  events: [
    {
      id: 'jf_e1',
      partId: 'climb',
      time: '15:00',
      title: 'Stone Steps',
      scene: 'Old street stairway',
      backgroundImage: null,
      sceneGradient: 'from-stone-200 to-emerald-100',
      sceneEmoji: '🪨',
      interactable: { label: 'Red Lantern', emoji: '🏮' },
      actionButtonText: 'Look up at the lantern',
      narration: 'Rain on stone, lanterns swaying.',
      rewardItemIds: [],
      unlockPhotoGroupIds: [],
    },
    {
      id: 'jf_e2',
      partId: 'tea',
      time: '15:40',
      title: 'Tea House',
      scene: 'Tea house interior',
      sceneGradient: 'from-emerald-100 to-amber-100',
      sceneEmoji: '🍵',
      interactable: { label: 'Tea Master', emoji: '🧑' },
      actionButtonText: 'Try the oolong',
      dialogue: 'Tea Master: It tastes better in the rain.',
      rewardItemIds: ['tea_leaf'],
      unlockPhotoGroupIds: ['jf_tea_house'],
      isFinal: true,
      endingText: 'You stayed until the rain quieted.',
    },
  ],
}
```

```js
// src/data/travelData.js — add three lines
import { jiufenLocation, jiufenItems, jiufenPhotoGroups } from './jiufenStreet.js'

export const items       = { ...nightMarketItems, ...rainyShrineItems, ...jiufenItems }
export const photoGroups = { ...nightMarketPhotoGroups, ...rainyShrinePhotoGroups, ...jiufenPhotoGroups }
export const locations   = [ ...existing, jiufenLocation ]
```

The map pin, timeline, dialog, progress bar, inventory, and album will all pick up the new content automatically.

### Event field reference

| Field                  | Notes                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| `id`                   | Unique within the location                                       |
| `partId`               | Must match a `parts[*].id` (use any string for short chapters)   |
| `time`                 | Display string (e.g. `18:20`, `Afternoon`)                       |
| `title`                | Shown above the scene                                            |
| `scene`                | Optional sub-title under the title                               |
| `backgroundImage`      | Optional URL/import for the scene background                     |
| `sceneGradient`        | Tailwind gradient (`from-xxx via-xxx to-xxx`) for the fallback   |
| `sceneEmoji`           | Decorative emoji shown when no `backgroundImage`                 |
| `interactable`         | `{ label, emoji }` — the clickable sticker                       |
| `actionButtonText`     | Text on the primary action button                                |
| `narration` / `dialogue` | One of the two; dialogue renders as `💬`, narration as `📖`    |
| `rewardItemIds`        | Array of item IDs (empty array if none)                          |
| `unlockPhotoGroupIds`  | Array of photo-group IDs (empty array if none)                   |
| `isFinal`              | Marks the location complete after this event                     |
| `endingText`           | Optional closing line shown on the final event                   |

### Adding souvenir items

```js
items: {
  flower_scent_card: {
    id: 'flower_scent_card',
    name: 'Flower Scent Memory Card',
    emoji: '🌸',
    description: 'The auntie let you smell the flowers she had grown.',
  },
}
```

### Adding photo groups

```js
photoGroups: {
  auntie_encounter_photos: {
    id: 'auntie_encounter_photos',
    title: 'The Auntie Under the Roof',
    caption: 'She walked into the rain with her umbrella and carefully pointed the way.',
    photos: [
      { id: 'p_auntie_1', title: 'Auntie', caption: 'Warm voice in heavy rain.',
        imageUrl: null, type: 'main', emoji: '☂️',
        gradient: 'from-rose-200 to-amber-100' },
      // 1..N more photos, all type: 'detail'
    ],
  },
}
```

---

## 5. Connecting a real Taiwan map (optional)

The current map is a hand-drawn SVG silhouette in `MapPage.jsx` (`<TaiwanMap />`). Two upgrade paths:

- **Real-feel scrapbook**: drop a watercolor PNG of Taiwan into `src/assets/taiwan.png` and replace the SVG with an `<img>`. Pin positions in the data (`pos: { top, left }`) are percent-based so they keep working.
- **Real geographic map**: `npm i leaflet react-leaflet`, render a `<MapContainer center={[23.7, 121]} zoom={7}>` with OpenStreetMap tiles, and convert each location's `pos` to `lat/lng`. Only the map component changes; events, photoGroups, items, and storage stay as-is.

Reference coordinates if you go geographic:
- Taipei Main Station: `25.0478, 121.5170`
- Shilin Night Market: `25.0883, 121.5246`
- Kenting / Seaside: `21.9466, 120.7975`
- Taoyuan Airport (return trip): `25.0797, 121.2342`

---

## 6. State & persistence

`App.jsx` keeps a single `progress` object in state and mirrors it to `localStorage` under the key `return_to_taiwan_v2`:

```js
{
  completedLocationIds:   ['night_market'],
  collectedItemIds:       ['paper_bag', 'recommendation_note', 'map_fragment'],
  unlockedPhotoGroupIds:  ['pg_dog_alley', 'pg_night_market_evening'],
  chapterProgress:        { rainy_shrine_route: 4 },   // resume index per location
}
```

When a chapter is completed, its entry is removed from `chapterProgress` and the location id is added to `completedLocationIds`. Re-opening a completed chapter starts from event 0 again (rewatch mode).

---

## 7. Notes on game design

- **No branching choices.** Every event is a fixed memory trigger. The interactable and the action button are equivalent — both fire the same narration, the same souvenirs, the same photo groups.
- **`rewardItemIds` and `unlockPhotoGroupIds` are arrays.** A single event can hand out multiple souvenirs and unlock multiple photo groups (see Event 9 / Event 11 of the Rainy Shrine Route).
- **Photo groups vs. CGs.** A photo group is a set of related photos under one cover. The Album shows them as a single card; the modal lets you flip through (carousel) or grid all photos.
- **Nothing is hardcoded.** The number of events, parts, photo groups, items, or locations is read from data at runtime.
