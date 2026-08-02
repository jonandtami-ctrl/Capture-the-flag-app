import CaptureTheFlagGame from './CaptureTheFlagGame.jsx'
import FlameBattlersGame from './FlameBattlersGame.jsx'
import RaccoonRaidGame from './RaccoonRaidGame.jsx'
import BountyHuntersGame from './BountyHuntersGame.jsx'
import PrankWarsGame from './PrankWarsGame.jsx'
import DiamondSmugglersGame from './DiamondSmugglersGame.jsx'
import DiscGolfGame from './DiscGolfGame.jsx'
import FishingGame from '../components/tools/FishingGame.jsx'
import MarketGame from '../components/tools/MarketGame.jsx'

// Maps a game's slug to its playable game component (canvas-based action
// games, or lighter DOM-based timing/clicking games where that fits the
// mechanic better).
export const PLAYABLE_GAMES = {
  'capture-the-flag': CaptureTheFlagGame,
  'flame-battlers': FlameBattlersGame,
  'raccoon-raid': RaccoonRaidGame,
  'bounty-hunters': BountyHuntersGame,
  'prank-wars': PrankWarsGame,
  'diamond-smugglers': DiamondSmugglersGame,
  'disc-golf': DiscGolfGame,
  'fishing-derby': FishingGame,
  'risk-takers': MarketGame,
}
