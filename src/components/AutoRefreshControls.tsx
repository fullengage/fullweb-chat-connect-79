import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AutoRefreshControlsProps {
  autoRefresh: boolean
  setAutoRefresh: (enabled: boolean) => void
  refreshInterval: number
  setRefreshInterval: (interval: number) => void
}

export const AutoRefreshControls = ({
  autoRefresh,
  setAutoRefresh,
  refreshInterval,
  setRefreshInterval
}: AutoRefreshControlsProps) => {
  return (
    <div className="flex items-center justify-between mt-3 text-xs">
      <label className="flex items-center gap-2 text-muted-foreground">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="rounded"
        />
        Auto-refresh
      </label>
      {autoRefresh && (
        <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(parseInt(v))}>
          <SelectTrigger className="h-6 w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10s</SelectItem>
            <SelectItem value="30">30s</SelectItem>
            <SelectItem value="60">1m</SelectItem>
            <SelectItem value="300">5m</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  )
}