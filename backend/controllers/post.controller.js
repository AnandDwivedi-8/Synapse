import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        console.log('📸 CREATE POST REQUEST');
        console.log('   Caption:', caption?.substring(0, 50));
        console.log('   Image:', image?.originalname, image?.size, 'bytes');
        console.log('   Author ID:', authorId);

        if (!image) {
            console.log('❌ No image provided');
            return res.status(400).json({ message: 'Image required' });
        }

        // image upload 
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        
        // Try Cloudinary, fallback to base64 if credentials missing
        let imageUrl = fileUri;
        try {
            const cloudResponse = await cloudinary.uploader.upload(fileUri);
            imageUrl = cloudResponse.secure_url;
            console.log('✅ Image uploaded to Cloudinary');
        } catch (cloudinaryError) {
            console.log('⚠️ Cloudinary upload failed, using base64 image');
            imageUrl = fileUri;
        }
        
        const post = await Post.create({
            caption,
            image: imageUrl,
            author: authorId
        });
        console.log('✅ Post created:', post._id);
        
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
            console.log('✅ Post added to user');
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        })

    } catch (error) {
        console.log('❌ Post creation error:', error.message);
        console.log(error);
        return res.status(500).json({
            message: 'Failed to create post',
            success: false,
            error: error.message
        });
    }
}
export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id; 
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        await post.save();

        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {
        console.log(error);
    }
}
export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            // emit a notification event
            const notification = {
                type:'dislike',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            console.log('Attempting to emit dislike notification:', {
                postOwnerId,
                postOwnerSocketId,
                notification
            });
            if(postOwnerSocketId){
                io.to(postOwnerSocketId).emit('notification', notification);
                console.log('Dislike notification emitted successfully');
            } else {
                console.log('Post owner not connected');
            }
        }



        return res.status(200).json({message:'Post disliked', success:true});
    } catch (error) {

    }
}
export const addComment = async (req,res) =>{
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;

        const {text} = req.body;

        const post = await Post.findById(postId);

        if(!text) return res.status(400).json({message:'text is required', success:false});

        const comment = await Comment.create({
            text,
            author:commentKrneWalaUserKiId,
            post:postId
        })

        await comment.populate({
            path:'author',
            select:"username profilePicture"
        });
        
        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message:'Comment Added',
            comment,
            success:true
        })

    } catch (error) {
        console.log(error);
    }
};
export const getCommentsOfPost = async (req,res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');

        if(!comments) return res.status(404).json({message:'No comments found for this post', success:false});

        return res.status(200).json({success:true,comments});

    } catch (error) {
        console.log(error);
    }
}
export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        // check if the logged-in user is the owner of the post
        if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorized'});

        // delete post
        await Post.findByIdAndDelete(postId);

        // remove the post id from the user's post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            success:true,
            message:'Post deleted'
        })

    } catch (error) {
        console.log(error);
    }
}
export const bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmarked -> remove from the bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});

        }else{
            // bookmark krna pdega
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked', success:true});
        }

    } catch (error) {
        console.log(error);
    }
}

// Get likes for a post
export const getLikesForPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId).populate('likes', 'username profilePicture bio');
        
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });
        
        return res.status(200).json({
            success: true,
            likes: post.likes || []
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to fetch likes', success: false });
    }
}

// Delete comment
export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.id;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found', success: false });

        // Check if user is the comment author
        if (comment.author.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized', success: false });
        }

        // Delete comment from post's comments array
        await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });
        
        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        return res.status(200).json({
            success: true,
            message: 'Comment deleted'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete comment', success: false });
    }
}

// Update comment
export const updateComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.id;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Comment text is required', success: false });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found', success: false });

        // Check if user is the comment author
        if (comment.author.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized', success: false });
        }

        comment.text = text;
        await comment.save();

        return res.status(200).json({
            success: true,
            message: 'Comment updated',
            comment
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to update comment', success: false });
    }
}