import ToolTabs from '../components/tools/ToolTabs.jsx'
import AdSlot from '../components/AdSlot.jsx'

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span className="chip mx-auto">No game required</span>
        <h1 className="section-heading mt-4">Standalone Tools</h1>
        <p className="mx-auto mt-3 max-w-xl text-forest-300/70">
          Making up your own game? Use the team randomizer, timer, and scoreboard on
          their own — works for any activity.
        </p>
      </div>

      <div className="mt-10">
        <ToolTabs storageKey="standalone" />
      </div>

      <div className="mt-14">
        <AdSlot format="horizontal" />
      </div>
    </div>
  )
}
