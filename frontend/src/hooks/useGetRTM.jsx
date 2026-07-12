import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socketio);
    const { messages } = useSelector(store => store.chat);
    const { selectedUser } = useSelector(store => store.auth);
    
    useEffect(() => {
        socket?.on('newMessage', (newMessage) => {
            // Only add message if it's from the currently selected user
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                dispatch(setMessages([...messages, newMessage]));
            }
        })

        return () => {
            socket?.off('newMessage');
        }
    }, [messages, socket, selectedUser, dispatch]);
};
export default useGetRTM;