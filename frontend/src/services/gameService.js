import api from './api'

export const gameService = {
  submitScore: (game, score, details) => api.post('/games/scores', { game, score, details }).then((r) => r.data),
  leaderboard: (params) => api.get('/games/leaderboard', { params }).then((r) => r.data),
}
