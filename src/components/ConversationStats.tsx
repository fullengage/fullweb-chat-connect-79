interface ConversationStatsProps {
  stats: {
    total: number
    unread: number
    assigned: number
    unassigned: number
  }
}

export const ConversationStats = ({ stats }: ConversationStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-1 text-xs">
      <div className="text-center p-2 bg-muted rounded">
        <div className="font-medium text-foreground">{stats.total}</div>
        <div className="text-muted-foreground">Total</div>
      </div>
      <div className="text-center p-2 bg-muted rounded">
        <div className="font-medium text-primary">{stats.unread}</div>
        <div className="text-muted-foreground">Não lidas</div>
      </div>
      <div className="text-center p-2 bg-muted rounded">
        <div className="font-medium text-green-600">{stats.assigned}</div>
        <div className="text-muted-foreground">Atribuídas</div>
      </div>
      <div className="text-center p-2 bg-muted rounded">
        <div className="font-medium text-orange-600">{stats.unassigned}</div>
        <div className="text-muted-foreground">Livres</div>
      </div>
    </div>
  )
}