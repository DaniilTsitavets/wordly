import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore, type EnhancedStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import type { RootState } from '@/store'

export type AppStore = EnhancedStore<RootState>

export function makeStore(preloadedState?: Partial<RootState>): AppStore {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: preloadedState as RootState,
  })
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>
  store?: AppStore
  route?: string
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = makeStore(preloadedState),
    route = '/',
    ...options
  }: RenderWithProvidersOptions = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  )
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) }
}

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
