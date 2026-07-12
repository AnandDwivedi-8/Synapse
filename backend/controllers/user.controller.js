import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        console.log('✅ LOGIN: Token generated for user:', user.email);
        console.log('   Token:', token.substring(0, 50) + '...');

        // populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }
        const response = res.cookie('token', token, { 
            httpOnly: true, 
            sameSite: 'Lax',
            secure: false,
            maxAge: 1 * 24 * 60 * 60 * 1000 
        });
        console.log('✅ LOGIN: Cookie set with httpOnly, sameSite=Lax, secure=false');
        return response.status(200).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user,
            token
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};
export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};

// Get current logged-in user profile
export const getCurrentUserProfile = async (req, res) => {
    try {
        const userId = req.id; // from isAuthenticated middleware
        const user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.error('Get Current User Profile Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let profilePictureUrl;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            try {
                const cloudResponse = await cloudinary.uploader.upload(fileUri);
                profilePictureUrl = cloudResponse.secure_url;
            } catch (cloudinaryError) {
                console.log('Cloudinary upload failed for profile picture, using base64');
                profilePictureUrl = fileUri;
            }
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = profilePictureUrl;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.error('Edit Profile Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};
export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        // Filter out any null or undefined entries
        const validUsers = suggestedUsers.filter(user => user && user._id);
        return res.status(200).json({
            success: true,
            users: validUsers
        })
    } catch (error) {
        console.error('Get Suggested Users Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};
export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id; // patel
        const jiskoFollowKrunga = req.params.id; // shivani
        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }
        // mai check krunga ki follow krna hai ya unfollow
        const isFollowing = user.following.includes(jiskoFollowKrunga);
        if (isFollowing) {
            // unfollow logic ayega
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } }),
            ])
            return res.status(200).json({ message: 'Unfollowed successfully', success: true });
        } else {
            // follow logic ayega
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } }),
            ])
            return res.status(200).json({ message: 'followed successfully', success: true });
        }
    } catch (error) {
        console.error('Follow/Unfollow Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
}

// Get followers
export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('followers', 'username profilePicture bio');
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        return res.status(200).json({
            success: true,
            followers: user.followers || []
        });
    } catch (error) {
        console.error('Get Followers Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
}

// Get following
export const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('following', 'username profilePicture bio');
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        return res.status(200).json({
            success: true,
            following: user.following || []
        });
    } catch (error) {
        console.error('Get Following Error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
}

// Search users by username
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const currentUserId = req.id;

        console.log('[searchUsers] REQUEST - q:', q, 'currentUserId:', currentUserId);

        if (!q || q.trim().length === 0) {
            console.log('[searchUsers] Empty query received');
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Search users by username (case-insensitive) and exclude current user
        const searchQuery = {
            username: { $regex: q, $options: 'i' },
            _id: { $ne: currentUserId }
        };

        console.log('[searchUsers] Search query:', JSON.stringify(searchQuery));

        const users = await User.find(searchQuery)
        .select('username email profilePicture bio gender _id followers')
        .limit(20);

        console.log('[searchUsers] Query:', q);
        console.log('[searchUsers] Found users:', users.length);
        console.log('[searchUsers] Users:', users);

        return res.status(200).json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Search Users Error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to search users",
            error: error.message
        });
    }
}