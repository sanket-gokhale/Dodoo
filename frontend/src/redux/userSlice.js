import { createSlice } from "@reduxjs/toolkit";

const getSavedHiddenComments = () => {
    try {
        const stored = localStorage.getItem("dodoo_hidden_comments");
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        suggestedUsers: null,
        profileData: null,
        hiddenComments: getSavedHiddenComments(),
        pendingRequestsCount: 0
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
            if (action.payload?.connectionRequests) {
                state.pendingRequestsCount = action.payload.connectionRequests.filter(
                    r => r.status === "pending"
                ).length;
            }
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setProfileData: (state, action) => {
            state.profileData = action.payload;
        },
        setPendingRequestsCount: (state, action) => {
            state.pendingRequestsCount = action.payload;
        },
        hideCommentLocally: (state, action) => {
            const commentId = action.payload;
            if (!state.hiddenComments.includes(commentId)) {
                state.hiddenComments.push(commentId);
                try {
                    localStorage.setItem("dodoo_hidden_comments", JSON.stringify(state.hiddenComments));
                } catch (e) {
                    console.error(e);
                }
            }
        },
        unhideCommentLocally: (state, action) => {
            const commentId = action.payload;
            state.hiddenComments = state.hiddenComments.filter(id => id !== commentId);
            try {
                localStorage.setItem("dodoo_hidden_comments", JSON.stringify(state.hiddenComments));
            } catch (e) {
                console.error(e);
            }
        },
        resetHiddenComments: (state) => {
            state.hiddenComments = [];
            try {
                localStorage.removeItem("dodoo_hidden_comments");
            } catch (e) {
                console.error(e);
            }
        }
    }
});

export const {
    setUserData,
    setSuggestedUsers,
    setProfileData,
    setPendingRequestsCount,
    hideCommentLocally,
    unhideCommentLocally,
    resetHiddenComments
} = userSlice.actions;

export default userSlice.reducer;