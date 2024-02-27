const Router = require('express').Router()
const bcrypt = require('bcrypt')
const mysql = require('mysql2/promise');
const newsfeedFunction = require('../controllers/newsfeed')



Router.get("/api/related-posts", async (req, res) => {
    try {
        const relatedPosts = await newsfeedFunction.getRelatedPosts(req.query);
        res.json({ relatedPosts });
    } catch (error) {
        console.error("Error fetching related posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/posts", async (req, res) => {
    try {
        const posts = await newsfeedFunction.getPosts();
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/getlikes", async (req, res) => {
    try {
        // Insert the comment into the database
        const likes = await newsfeedFunction.getLikes(req.query);
        res.json({ likes });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.post("/api/addLikes", async (req, res) => {
    try {
        const likes = await newsfeedFunction.addLikes(req.body);
        res.json({ likes });        
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Router.get("/api/getInterests", async (req, res) => {
//     try {
//         const [interests] = await newsfeedFunction.getInterests();
//         res.json({ interests });        
//     } catch (error) {
//         console.error("Error fetching posts:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });


Router.get("/api/xposts", async (req, res) => {
    try {
        const posts = await newsfeedFunction.getxPosts(req.query);
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching xposts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/posts/latestupdate", async (req, res) => {
    // Number of posts to fetch, passed as a query parameter
    const numberOfPosts = req.query.num ? parseInt(req.query.num, 10) : 10; // Default to 10 posts if not specified

    try {
        const posts = await newsfeedFunction.getLatestUpdatePosts(numberOfPosts);
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching latest update posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/posts/latestcreation", async (req, res) => {
    // Number of posts to fetch, passed as a query parameter
    const numberOfPosts = req.query.num ? parseInt(req.query.num, 10) : 10; // Default to 10 posts if not specified

    try {
        const posts = await newsfeedFunction.getLatestCreationPosts(numberOfPosts);
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching latest created posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/enhancedposts", async (req, res) => {
    try {
        const posts = await newsfeedFunction.getEnhancedPosts();
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching enhanced posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/enhanced-related-posts", async (req, res) => {
    try {
        const relatedPosts = await newsfeedFunction.getEnhancedRelatedPosts(req.query);
        res.json({ relatedPosts });
    } catch (error) {
        console.error("Error fetching related posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/enhanced-xposts", async (req, res) => {
    try {
        const posts = await newsfeedFunction.getEnhancedxPosts(req.query);
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching xposts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/posts/enhancedlatestupdate", async (req, res) => {
    // Number of posts to fetch, passed as a query parameter
    const numberOfPosts = req.query.num ? parseInt(req.query.num, 10) : 10; // Default to 10 posts if not specified

    try {
        const posts = await newsfeedFunction.getEnhancedLatestUpdatePosts(numberOfPosts);
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching latest update posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/posts/enhancedlatestcreation", async (req, res) => {
    // Number of posts to fetch, passed as a query parameter
    const numberOfPosts = req.query.num ? parseInt(req.query.num, 10) : 10; // Default to 10 posts if not specified

    try {
        const posts = await newsfeedFunction.getEnhancedLatestCreationPosts(numberOfPosts);
        res.json({ posts });
    } catch (error) {
        console.error("Error fetching latest created posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.get("/api/comments", async (req, res) => {
    // Get the postid from query parameters
    const { postid } = req.query;

    if (!postid) {
        return res.status(400).json({ error: "Missing required postid query parameter." });
    }

    try {
        const comments = await newsfeedFunction.getComments(postid);
        res.json({ comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Router.post("/api/comments", async (req, res) => {
    // Extract comment details from the request body
    const { postid, comment_userid, comment } = req.body;

    if (!postid || !comment_userid || !comment) {
        return res.status(400).json({ error: "Missing required comment fields." });
    }
    try {
        // Insert the comment into the database
        const result = await newsfeedFunction.postComments(req.body);
       
        res.status(201).json({ message: "Comment added successfully", commentId: result.insertId });
    } catch (error) {
        console.error("Error posting comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



module.exports = Router