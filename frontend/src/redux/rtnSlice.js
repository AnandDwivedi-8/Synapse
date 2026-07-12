import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name:'realTimeNotification',
    initialState:{
        likeNotification:[], // [{ userId, userDetails, type: 'like', timestamp }]
    },
    reducers:{
        setLikeNotification:(state,action)=>{
            console.log('setLikeNotification called with:', action.payload);
            const payload = action.payload;
            
            // Handle all notification types: like, comment, follow
            if(payload && payload.type){
                // Check if similar notification already exists (for likes on same post by same user)
                if(payload.type === 'like' || payload.type === 'comment') {
                    const existingNotif = state.likeNotification.find(
                        item => item.userId === payload.userId && item.postId === payload.postId && item.type === payload.type
                    );
                    if (existingNotif) {
                        console.log('Notification already exists, skipping duplicate');
                        return;
                    }
                }
                
                // Add new notification at the beginning
                state.likeNotification.unshift({
                    ...payload,
                    timestamp: payload.timestamp || new Date().toISOString()
                });
                
                // Keep only last 100 notifications
                if (state.likeNotification.length > 100) {
                    state.likeNotification = state.likeNotification.slice(0, 100);
                }
                console.log('Notification added. Total:', state.likeNotification.length);
            }else if(payload && payload.type === 'dislike'){
                state.likeNotification = state.likeNotification.filter(
                    (item) => !(item.userId === payload.userId && item.postId === payload.postId && item.type === 'like')
                );
            }
            console.log('Current notifications:', state.likeNotification);
        },
        clearNotifications:(state) => {
            state.likeNotification = [];
        },
        removeNotification:(state, action) => {
            state.likeNotification = state.likeNotification.filter(
                (item) => item.userId !== action.payload
            );
        }
    }
});
export const { setLikeNotification, clearNotifications, removeNotification } = rtnSlice.actions;
export default rtnSlice.reducer;