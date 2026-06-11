import { createContext, useCallback, useContext } from 'react'

const ApiContext = createContext(null)
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export function ApiProvider({ getToken, children }) {
  const api = useCallback(async (path, options = {}) => {
    const token = await getToken()
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'No se pudo completar la operación')
    }
    return response.status === 204 ? null : response.json()
  }, [getToken])
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => useContext(ApiContext)
