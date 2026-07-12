import { setSuggestedUsers } from "@/redux/authSlice";
import API from "@/lib/axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetConversations = () => {
    const dispatch = useDispatch();
    const { user, selectedUser } = useSelector(store => store.auth);
    
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await API.get('/message/conversations');
                let usersToShow = [];
                
                // Get conversation users
                if (res.data.success && res.data.conversations.length > 0) {
                    const conversationUsers = res.data.conversations
                        .map(conv => conv.user)
                        .filter(user => user && user._id); // Filter out null users
                    usersToShow = conversationUsers;
                } 
                
                // Get followed users
                if (user?.following && user.following.length > 0) {
                    try {
                        const suggestedRes = await API.get('/user/suggested');
                        if (suggestedRes.data.success && suggestedRes.data.users) {
                            // Merge followed users with conversation users, avoiding duplicates
                            const conversationUserIds = usersToShow.map(u => u._id);
                            const followedUsers = suggestedRes.data.users.filter(
                                u => !conversationUserIds.includes(u._id)
                            );
                            usersToShow = [...usersToShow, ...followedUsers];
                        }
                    } catch (err) {
                        console.error("Error fetching suggested users:", err);
                    }
                } else if (usersToShow.length === 0) {
                    // If no conversations and not following anyone, fetch suggested users
                    try {
                        const suggestedRes = await API.get('/user/suggested');
                        if (suggestedRes.data.success && suggestedRes.data.users) {
                            usersToShow = suggestedRes.data.users;
                        }
                    } catch (err) {
                        console.error("Error fetching suggested users:", err);
                    }
                }
                
                // Filter out any null/undefined users before dispatching
                const validUsers = usersToShow.filter(user => user && user._id);
                dispatch(setSuggestedUsers(validUsers));
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };
        
        fetchConversations();
        
        // Poll for new conversations every 5 seconds
        const interval = setInterval(fetchConversations, 5000);
        
        return () => clearInterval(interval);
    }, [dispatch, user?.following, selectedUser]);
};

export default useGetConversations;
