import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { api } from "./api/apiSlice"
import destinationsReducer from "./features/destinationsSlice"
import packagesReducer from "./features/packagesSlice"
import bookingsReducer from "./features/bookingsSlice"

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        destinations: destinationsReducer,
        packages: packagesReducer,
        bookings: bookingsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
