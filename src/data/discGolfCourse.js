// The 18 holes of Pinecone Ridge — a fictional wooded disc golf course.
// Shared between the game's "course guide" copy and the Scorecard tool
// so par values never drift out of sync.
export const courseName = 'Pinecone Ridge'

export const holes = [
  { number: 1, name: 'The Trailhead', par: 3, distance: 220, feature: 'A wide, straight fairway lined with birch trees — a gentle warm-up.' },
  { number: 2, name: 'Fern Gully', par: 3, distance: 260, feature: 'A tight tunnel shot through ferns and low-hanging branches.' },
  { number: 3, name: 'Boulder Bend', par: 4, distance: 380, feature: 'Dogleg right around a field of mossy boulders.' },
  { number: 4, name: 'Creek Crossing', par: 3, distance: 240, feature: 'Drive over a shallow creek bed to a basket tucked on the far bank.' },
  { number: 5, name: 'The Cathedral', par: 3, distance: 200, feature: 'Tall pines form a natural ceiling — accuracy beats distance here.' },
  { number: 6, name: "Widow-Maker Hill", par: 4, distance: 410, feature: 'An uphill fairway with a sharp drop-off along the left side.' },
  { number: 7, name: "Squirrel's Nest", par: 3, distance: 180, feature: 'Short and tricky — the approach threads through low canopy.' },
  { number: 8, name: 'The Gauntlet', par: 5, distance: 520, feature: 'A long, twisting fairway through the densest part of the woods.' },
  { number: 9, name: 'Sunset Clearing', par: 3, distance: 250, feature: 'The fairway opens into a meadow — your first real chance to let a driver rip.' },
  { number: 10, name: 'Rooted Ridge', par: 4, distance: 360, feature: 'Watch your footing — exposed roots cover the whole fairway.' },
  { number: 11, name: 'The Chute', par: 3, distance: 210, feature: 'A narrow gap between two old oaks guards the basket.' },
  { number: 12, name: "Hawk's Perch", par: 4, distance: 390, feature: 'An elevated tee box looks out over the entire back nine.' },
  { number: 13, name: 'Bramble Patch', par: 3, distance: 230, feature: 'Thick brush lines both sides — an errant throw gets swallowed whole.' },
  { number: 14, name: 'The Switchback', par: 4, distance: 370, feature: 'A sharp left-hand dogleg around a fallen log.' },
  { number: 15, name: 'Quiet Hollow', par: 3, distance: 190, feature: 'Short and shaded, but the basket sits in a natural bowl that\'s easy to misjudge.' },
  { number: 16, name: 'Long Shot Lane', par: 5, distance: 540, feature: 'The longest hole on the course — a true three-shotter.' },
  { number: 17, name: 'Pinecone Alley', par: 3, distance: 215, feature: 'A gentle downhill finish before the final stretch.' },
  { number: 18, name: 'Campfire Close', par: 4, distance: 350, feature: 'Finish within sight of the fire pit — bring the whole camp to watch the final putt.' },
]

export const totalPar = holes.reduce((sum, h) => sum + h.par, 0)
