import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const cleanup = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error("MONGO_URI not found in .env");
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // Get all users
        const allUsers = await User.find();
        console.log(`Total users found: ${allUsers.length}`);

        const validUserIds = new Set(allUsers.map(user => user._id.toString()));
        console.log(`Valid user IDs: ${validUserIds.size}`);

        let totalCleaned = 0;
        let followersRemoved = 0;
        let followingRemoved = 0;

        // For each user, clean their followers and following arrays
        for (const user of allUsers) {
            let userUpdated = false;

            // Clean followers array - remove deleted users
            const validFollowers = user.followers.filter(followerId => 
                validUserIds.has(followerId.toString())
            );

            if (validFollowers.length < user.followers.length) {
                followersRemoved += user.followers.length - validFollowers.length;
                user.followers = validFollowers;
                userUpdated = true;
            }

            // Clean following array - remove deleted users
            const validFollowing = user.following.filter(followingId => 
                validUserIds.has(followingId.toString())
            );

            if (validFollowing.length < user.following.length) {
                followingRemoved += user.following.length - validFollowing.length;
                user.following = validFollowing;
                userUpdated = true;
            }

            // Save if user was updated
            if (userUpdated) {
                await user.save();
                totalCleaned++;
                console.log(`✓ Cleaned ${user.username}: followers ${user.followers.length}, following ${user.following.length}`);
            }
        }

        console.log("\n=== Cleanup Summary ===");
        console.log(`Users cleaned: ${totalCleaned}`);
        console.log(`Followers references removed: ${followersRemoved}`);
        console.log(`Following references removed: ${followingRemoved}`);
        console.log("Cleanup completed successfully!");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error during cleanup:", error);
        process.exit(1);
    }
};

cleanup();
