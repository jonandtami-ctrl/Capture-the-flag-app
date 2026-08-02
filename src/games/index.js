import CaptureTheFlagGame from './CaptureTheFlagGame.jsx'
import FlameBattlersGame from './FlameBattlersGame.jsx'
import RaccoonRaidGame from './RaccoonRaidGame.jsx'
import SharksMinnowsGame from './SharksMinnowsGame.jsx'
import BountyHuntersGame from './BountyHuntersGame.jsx'
import GagaBallGame from './GagaBallGame.jsx'
import KingOfCourtGame from './KingOfCourtGame.jsx'
import PrankWarsGame from './PrankWarsGame.jsx'
import DiamondSmugglersGame from './DiamondSmugglersGame.jsx'
import ColorWarsGame from './ColorWarsGame.jsx'
import ScavengerHuntGame from './ScavengerHuntGame.jsx'
import DiscGolfGame from './DiscGolfGame.jsx'
import FishingGame from '../components/tools/FishingGame.jsx'
import MarketGame from '../components/tools/MarketGame.jsx'

// Maps a game's slug to its playable game component (canvas-based action
// games, or lighter DOM-based timing/clicking games where that fits the
// mechanic better). Games not yet converted simply won't appear here.
export const PLAYABLE_GAMES = {
  'capture-the-flag': CaptureTheFlagGame,
  'flame-battlers': FlameBattlersGame,
  'raccoon-raid': RaccoonRaidGame,
  'sharks-and-minnows': SharksMinnowsGame,
  'bounty-hunters': BountyHuntersGame,
  'gaga-ball': GagaBallGame,
  'king-of-the-court': KingOfCourtGame,
  'prank-wars': PrankWarsGame,
  'diamond-smugglers': DiamondSmugglersGame,
  'color-wars': ColorWarsGame,
  'scavenger-hunt': ScavengerHuntGame,
  'disc-golf': DiscGolfGame,
  'fishing-derby': FishingGame,
  'risk-takers': MarketGame,
}
