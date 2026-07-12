import { setMessages } from "@/redux/chatSlice";
import { setPosts } from "@/redux/postSlice";
import API from "@/lib/axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);
    
    useEffect(() => {
        const fetchAllMessage = async () => {
            if (!selectedUser?._id) {
                dispatch(setMessages([]));
                return;
            }
            try {
                const res = await API.get(`/message/all/${selectedUser?._id}`);
                if (res.data.success) {  
                    dispatch(setMessages(res.data.messages || []));
                }
            } catch (error) {
                console.log("Error fetching messages:", error);
                dispatch(setMessages([]));
            }
        }
        
        // Fetch messages immediately when selectedUser changes
        fetchAllMessage();
        
        // Set up polling to refresh messages every 3 seconds
        const interval = setInterval(fetchAllMessage, 3000);
        
        return () => clearInterval(interval);
    }, [selectedUser?._id, dispatch]);
};

export default useGetAllMessage;