// Maps a game's `theme` key to concrete Tailwind class groups so components
// don't need a giant switch statement scattered everywhere.
export const themeStyles = {
  forest: {
    text: 'text-forest-300',
    ring: 'ring-forest-500/40',
    border: 'border-forest-500/30',
    bg: 'bg-forest-500/10',
    solidBg: 'bg-forest-600',
    gradient: 'from-forest-500 to-forest-700',
    glow: 'shadow-glow-forest',
    hoverBorder: 'hover:border-forest-400/60',
  },
  ember: {
    text: 'text-ember-300',
    ring: 'ring-ember-500/40',
    border: 'border-ember-500/30',
    bg: 'bg-ember-500/10',
    solidBg: 'bg-ember-600',
    gradient: 'from-ember-500 to-ember-700',
    glow: 'shadow-glow',
    hoverBorder: 'hover:border-ember-400/60',
  },
}

export const getTheme = (key) => themeStyles[key] ?? themeStyles.forest
