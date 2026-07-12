import { useState, useCallback } from "react";
import API from "@/lib/axios";

const useSearchUsers = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const searchUsers = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setSearchQuery("");
            return;
        }

        try {
            setIsSearching(true);
            setSearchQuery(query);
            console.log('[useSearchUsers] Searching for:', query);
            
            const res = await API.get(`/user/search?q=${encodeURIComponent(query)}`);
            console.log('[useSearchUsers] Search results:', res.data);
            
            if (res.data.success) {
                setSearchResults(res.data.users || []);
            }
        } catch (error) {
            console.error('[useSearchUsers] Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setSearchResults([]);
        setSearchQuery("");
    }, []);

    return {
        searchResults,
        isSearching,
        searchQuery,
        searchUsers,
        clearSearch
    };
};

export default useSearchUsers;
