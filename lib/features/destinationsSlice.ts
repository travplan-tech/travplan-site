import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Destination {
    id: number
    name: string
    description: string
    country: string
    image: string
    rating: number
    popularity: number
}

interface DestinationsState {
    selectedDestination: Destination | null
    filter: string
}

const initialState: DestinationsState = {
    selectedDestination: null,
    filter: "",
}

export const destinationsSlice = createSlice({
    name: "destinations",
    initialState,
    reducers: {
        setSelectedDestination: (state, action: PayloadAction<Destination | null>) => {
            state.selectedDestination = action.payload
        },
        setFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload
        },
    },
})

export const { setSelectedDestination, setFilter } = destinationsSlice.actions
export default destinationsSlice.reducer
