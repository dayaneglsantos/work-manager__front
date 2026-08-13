import { setupServer } from 'msw/node'

// Cada teste registra somente as respostas de API necessárias ao seu cenário.
export const server = setupServer()
