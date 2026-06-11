import { createContext, useCallback, useContext } from 'react'

const ApiContext = createContext(null)
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function ApiProvider({ getToken, requireToken = true, children }) {
  const api = useCallback(async (path, options = {}) => {
    let token = await getToken()
    for (let attempt = 0; requireToken && !token && attempt < 3; attempt += 1) {
      await wait(250)
      token = await getToken({ skipCache: true })
    }
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'No se pudo completar la operación')
    }
    return response.status === 204 ? null : response.json()
  }, [getToken, requireToken])
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => useContext(ApiContext)
