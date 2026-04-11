import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Package {
    id: number
    title: string
    price: number
    duration: number
}

interface PackagesState {
    favorites: Package[]
}

const initialState: PackagesState = {
    favorites: [],
}

export const packagesSlice = createSlice({
    name: "packages",
    initialState,
    reducers: {
        addToFavorites: (state, action: PayloadAction<Package>) => {
            state.favorites.push(action.payload)
        },
        removeFromFavorites: (state, action: PayloadAction<number>) => {
            state.favorites = state.favorites.filter((pkg) => pkg.id !== action.payload)
        },
    },
})

export const { addToFavorites, removeFromFavorites } = packagesSlice.actions
export default packagesSlice.reducer
