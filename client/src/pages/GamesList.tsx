import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api, GameListItem } from "@/lib/api"

const formatType = (type: string | null) => type ?? "Unknown"

const GamesList = () => {
  const [games, setGames] = useState<GameListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .listGames()
      .then((data) => {
        setGames(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load games")
        setLoading(false)
      })
  }, [])

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Games</h1>
        <p className="text-sm text-muted-foreground">
          Browse all recorded games and drill into player stats.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border p-6">Loading games…</div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Game ID</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Players</th>
                <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">#{game.id}</td>
                  <td className="px-4 py-3">{formatType(game.type)}</td>
                  <td className="px-4 py-3">{game.playerCount}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/games/${game.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default GamesList
