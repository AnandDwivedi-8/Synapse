import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
        unreadMessages: {}, // { userId: count }
    },
    reducers:{
        // actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        },
        addUnreadMessage:(state, action) => {
            const { userId } = action.payload;
            state.unreadMessages[userId] = (state.unreadMessages[userId] || 0) + 1;
        },
        clearUnreadMessages:(state, action) => {
            const { userId } = action.payload;
            delete state.unreadMessages[userId];
        },
        setUnreadMessages:(state, action) => {
            state.unreadMessages = action.payload;
        }
    }
});
export const { setOnlineUsers, setMessages, addUnreadMessage, clearUnreadMessages, setUnreadMessages } = chatSlice.actions;
export default chatSlice.reducer;