import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
	name: "auth",
	initialState: null,
	reducers: {
		addAuth: (state, action) => {
			return action.payload;
		},
		removeAuth: (state) => {
			return null;
		},
		addFollowing: (state, action) => {
			if (state) {
				state.following = state.following || [];
				state.following.push(action.payload);
			}
		},
		removeFollowing: (state, action) => {
			if (state) {
				state.following = state.following.filter(id => id !== action.payload);
			}
		},
		updateUser: (state, action) => {
			return { ...state, ...action.payload };
		},
	},
});
export const { addAuth, removeAuth, addFollowing, removeFollowing, updateUser } = authSlice.actions;
export default authSlice.reducer;
