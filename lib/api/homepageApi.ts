import { api } from "./apiSlice"

interface HomepageSettings {
    heroBackgroundImage: string
    bannerImage?: string
    heroTitle?: string
    heroSubtitle?: string
}

export const homepageApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get homepage settings (public)
        getHomepageSettings: builder.query<HomepageSettings, void>({
            query: () => "/homepage-settings",
            providesTags: ["HomepageSettings"],
        }),

        // Update homepage setting (admin)
        updateHomepageSetting: builder.mutation<
            { key: string; value: string },
            { key: string; value: string }
        >({
            query: (data) => ({
                url: "/admin/settings",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["HomepageSettings", "Settings"],
        }),
    }),
})

export const {
    useGetHomepageSettingsQuery,
    useUpdateHomepageSettingMutation,
} = homepageApi
