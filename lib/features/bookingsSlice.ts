import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Booking {
    id: number
    packageId: number
    startDate: string
    endDate: string
    numberOfPeople: number
}

interface BookingsState {
    currentBooking: Booking | null
    bookingHistory: Booking[]
}

const initialState: BookingsState = {
    currentBooking: null,
    bookingHistory: [],
}

export const bookingsSlice = createSlice({
    name: "bookings",
    initialState,
    reducers: {
        setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
            state.currentBooking = action.payload
        },
        addToHistory: (state, action: PayloadAction<Booking>) => {
            state.bookingHistory.push(action.payload)
        },
    },
})

export const { setCurrentBooking, addToHistory } = bookingsSlice.actions
export default bookingsSlice.reducer
