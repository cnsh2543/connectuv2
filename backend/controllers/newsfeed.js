
const {pool} = require('./pools')

const getRelatedPosts = async (queryParameters) => {
    let baseQuery = "SELECT * FROM posts WHERE 1=1";
    const queryParams = [];
    
    // Dynamically add conditions based on query parameters
    if (queryParameters.postid) {
        baseQuery += " AND postid = ?";
        queryParams.push(queryParameters.postid);
    }

	if (queryParameters.userid) {
        baseQuery += " AND userid = ?";
        queryParams.push(queryParameters.userid);
    }
	
	if (queryParameters.interestid) {
        baseQuery += " AND interestid = ?";
        queryParams.push(queryParameters.interestid);
    }

    if ('visibility' in queryParameters) { // Explicitly checking for presence to allow filtering by visibility=0
        baseQuery += " AND visibility = ?";
        queryParams.push(queryParameters.visibility);
    }

    if ('active' in queryParameters) { // Explicitly checking for presence to allow filtering by active=0
        baseQuery += " AND active = ?";
        queryParams.push(queryParameters.active);
    }

	// Filtering based on timestamp
    if (queryParameters.createTimestamp) {
        baseQuery += " AND create_timestamp >= ?";
        queryParams.push(queryParameters.createTimestamp);
    }

    if (queryParameters.updateTimestamp) {
        baseQuery += " AND last_update_timestamp >= ?";
        queryParams.push(queryParameters.updateTimestamp);
    }

    try {
        
        const [results] = await pool.query(baseQuery, queryParams);
        return results;
    } catch (error) {
        throw error;
    }
};

const getPosts = async () => {
    try {
        
        const [results] = await pool.query("SELECT * FROM posts");
        return results;
    } catch (error) {
        throw error;
    }
};

const getInterests = async () => {
    try {
        
        const interests = await pool.query(
            "SELECT interest, url, interestid FROM interest")
        return interests;
    } catch (error) {
        throw error;
    }
};

const getLikes = async (queryParameters) => {
    try {
        
        const [likes] = await pool.query(
            "SELECT postid FROM likes WHERE like_userid = ?",
            [queryParameters.username])
        return likes;
    } catch (error) {
        throw error;
    }
};

const addLikes = async (queryParameters) => {
    try {
        
        const { postid, like_userid, like_timestamp, add_operation} = queryParameters;
        if (add_operation) {
            const [likes] = await pool.query(
                "INSERT INTO likes (postid, like_userid, like_timestamp) VALUES (?,?,?)",
                [postid, like_userid, like_timestamp]
            );
            return likes;
        } else {
            const [likes] = await pool.query(
                "DELETE FROM likes WHERE postid = ? AND like_userid = ?",
                [postid, like_userid]
            );
            return likes;
        }
    } catch (error) {
        throw error;
    }
};

const postComments = async (queryParameters) => {
    try {
        
        
        const { postid, comment_userid, comment } = queryParameters;
        const comment_timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const [result] = await pool.query(
            "INSERT INTO comments (postid, comment_userid, comment_timestamp, comment) VALUES (?, ?, ?, ?)",
            [postid, comment_userid, comment_timestamp, comment]
        );
        return result;
        
    } catch (error) {
        throw error;
    }
};

const getxPosts = async (queryParameters) => {
    let baseQuery = "SELECT * FROM posts";
    const queryParams = [];

    // Determine the sorting field and order
    const validSortFields = ['postid', 'create_timestamp', 'last_update_timestamp'];
    const sortField = validSortFields.includes(queryParameters.sortField) ? queryParameters.sortField : 'postid';
    // Invert the sort order for the initial selection to get the last 'n' rows
    const sortOrder = queryParameters.sortOrder === 'asc' ? 'DESC' : 'ASC';

    // Add sorting to the query
    baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;

    // Set the limit for the number of posts to retrieve
    const limit = queryParameters.num ? parseInt(queryParameters.num, 10) : 10; // Default to 10 if not specified
    queryParams.push(limit);

    baseQuery += " LIMIT ?";

    try {
        
        // Fetch the last 'n' posts in the inverted order
        const [results] = await pool.query(baseQuery, queryParams);
        // If the original sortOrder was 'asc', we need to reverse the results since they were fetched in 'desc' order
        if (queryParameters.sortOrder === 'asc') {
            results.reverse();
        }

        return results;
    } catch (error) {
        throw error;
    }
};

const getLatestUpdatePosts = async (numberOfPosts) => {
    try {
        
        const [results] = await pool.query(
            "SELECT * FROM posts WHERE active = 1 AND visibility = 1 ORDER BY last_update_timestamp DESC LIMIT ?",
            [numberOfPosts]
        );
        return results;
    } catch (error) {
        throw error;
    }
};

const getLatestCreationPosts = async (numberOfPosts) => {
    try {
        
        const [results] = await pool.query(
            "SELECT * FROM posts WHERE active = 1 AND visibility = 1 ORDER BY create_timestamp DESC LIMIT ?",
            [numberOfPosts]
        );
        return results;
    } catch (error) {
        throw error;
    }
};

const getEnhancedPosts = async () => {
    try {
        const query = `
            SELECT 
                p.postid, 
                p.userid, 
                p.create_timestamp, 
                p.last_update_timestamp, 
                p.interestid, 
                p.header, 
                p.description, 
                p.visibility, 
                p.active, 
                COUNT(DISTINCT l.like_userid) AS number_of_likes, 
                u.universityid, 
                un.university, 
                c.interest
            FROM 
                posts p
            LEFT JOIN 
                likes l ON p.postid = l.postid
            JOIN 
                users u ON p.userid = u.userid
            JOIN 
                universities un ON u.universityid = un.universityid
            JOIN 
                interest c ON p.interestid = c.interestid
            GROUP BY 
                p.postid, u.universityid, un.university, c.interest
            ORDER BY 
                p.postid DESC;`;
        
        const [results] = await pool.query(query);
        return results;
    } catch (error) {
        console.error("SQL Error: ", error.message);
        throw error;
    }
};

const getEnhancedRelatedPosts = async (queryParameters) => {
    let baseQuery = `
        SELECT 
            p.postid, p.userid, p.create_timestamp, p.last_update_timestamp, p.interestid, 
            p.header, p.description, p.visibility, p.active, 
            COUNT(DISTINCT l.like_userid) AS number_of_likes, 
            u.firstname, u.lastname, u.universityid, un.university, c.interest
        FROM 
            posts p
        LEFT JOIN 
            likes l ON p.postid = l.postid
        INNER JOIN 
            users u ON p.userid = u.userid
        INNER JOIN 
            universities un ON u.universityid = un.universityid
        INNER JOIN 
            interest c ON p.interestid = c.interestid
    `;
    const queryParams = [];

    baseQuery += " WHERE 1=1";

    // Dynamically add conditions based on query parameters
    if (queryParameters.postid) {
        baseQuery += " AND p.postid = ?";
        queryParams.push(queryParameters.postid);
    }

    if (queryParameters.userid) {
        baseQuery += " AND p.userid = ?";
        queryParams.push(queryParameters.userid);
    }

    if (queryParameters.interestid) {
        baseQuery += " AND p.interestid = ?";
        queryParams.push(queryParameters.interestid);
    }

    if ('visibility' in queryParameters) {
        baseQuery += " AND p.visibility = ?";
        queryParams.push(queryParameters.visibility);
    }

    if ('active' in queryParameters) {
        baseQuery += " AND p.active = ?";
        queryParams.push(queryParameters.active);
    }

    if (queryParameters.createTimestamp) {
        baseQuery += " AND p.create_timestamp >= ?";
        queryParams.push(queryParameters.createTimestamp);
    }

    if (queryParameters.updateTimestamp) {
        baseQuery += " AND p.last_update_timestamp >= ?";
        queryParams.push(queryParameters.updateTimestamp);
    }

    baseQuery += " GROUP BY p.postid, u.firstname, u.lastname, u.universityid, un.university, c.interest";

    try {
        
        const [results] = await pool.query(baseQuery, queryParams);
        return results;
    } catch (error) {
        console.error("SQL Error: ", error.message);
        throw error;
    }
};

// Get limited number of posts, dynamic filter sorting desc/asce for postid, create_timestamp, last_update_timestamp 
const getEnhancedxPosts = async (queryParameters) => {
    const limit1 = queryParameters.num ? parseInt(queryParameters.num, 10) : 10;
    const page = queryParameters.page ? parseInt(queryParameters.page, 10) : 1;
    const offset = (page - 1) * limit1;
	let baseQuery = `
        SELECT 
            p.postid, p.userid, p.create_timestamp, p.last_update_timestamp, p.interestid, 
            p.header, p.description, p.visibility, p.active, 
            COUNT(DISTINCT l.like_userid) AS number_of_likes, 
            u.firstname, u.lastname, u.universityid, un.university, c.interest
        FROM 
            posts p
        LEFT JOIN 
            likes l ON p.postid = l.postid
        INNER JOIN 
            users u ON p.userid = u.userid
        INNER JOIN 
            universities un ON u.universityid = un.universityid
        INNER JOIN 
            interest c ON p.interestid = c.interestid
    `;
    const queryParams = [];

    // Existing code for dynamic filtering
	if (queryParameters.postid) {
		baseQuery += " AND p.postid = ?";
		queryParams.push(queryParameters.postid);
	}

	if (queryParameters.userid) {
		baseQuery += " AND p.userid = ?";
		queryParams.push(queryParameters.userid);
	}

	if (queryParameters.interestid) {
		baseQuery += " AND p.interestid = ?";
		queryParams.push(queryParameters.interestid);
	}

	if ('visibility' in queryParameters) { // Explicitly checking for presence to allow filtering by visibility=0
		baseQuery += " AND p.visibility = ?";
		queryParams.push(queryParameters.visibility);
	}

	if ('active' in queryParameters) { // Explicitly checking for presence to allow filtering by active=0
		baseQuery += " AND p.active = ?";
		queryParams.push(queryParameters.active);
	}

	if (queryParameters.createTimestamp) {
		baseQuery += " AND p.create_timestamp >= ?";
		queryParams.push(queryParameters.createTimestamp);
	}

	if (queryParameters.updateTimestamp) {
		baseQuery += " AND p.last_update_timestamp >= ?";
		queryParams.push(queryParameters.updateTimestamp);
	}

    baseQuery += " GROUP BY p.postid, u.firstname, u.lastname, u.universityid, un.university, c.interest";

    // Determine the sorting field and order
    const validSortFields = ['p.postid', 'p.create_timestamp', 'p.last_update_timestamp'];
    const sortField = validSortFields.includes(`p.${queryParameters.sortField}`) ? `p.${queryParameters.sortField}` : 'p.postid';
    // Invert the sort order for the initial selection to get the last 'n' rows
    const sortOrder = queryParameters.sortOrder === 'asc' ? 'DESC' : 'ASC';

    // Add sorting to the query
    baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;

    // Set the limit for the number of posts to retrieve
    //const limit = queryParameters.num ? parseInt(queryParameters.num, 10) : 10; // Default to 10 if not specified
    //queryParams.push(limit);

	baseQuery += " LIMIT ?, ?"; 
    queryParams.push(offset, limit1);

    try {
        
        const [results] = await pool.query(baseQuery, queryParams);
		if (queryParameters.sortOrder === 'asc') {
            results.reverse();
        }
        return results;
    } catch (error) {
        throw error;
    }

};

const getEnhancedLatestUpdatePosts = async (numberOfPosts) => {
    try {
        const query = `
            SELECT 
                p.postid, p.userid, p.create_timestamp, p.last_update_timestamp, p.interestid, 
                p.header, p.description, p.visibility, p.active, 
                COUNT(DISTINCT l.like_userid) AS number_of_likes, 
                u.firstname, u.lastname, u.universityid, un.university, c.interest
            FROM 
                posts p
            LEFT JOIN 
                likes l ON p.postid = l.postid
            INNER JOIN 
                users u ON p.userid = u.userid
            INNER JOIN 
                universities un ON u.universityid = un.universityid
            INNER JOIN 
                interest c ON p.interestid = c.interestid
            WHERE 
                p.active = 1 AND p.visibility = 1
            GROUP BY 
                p.postid, u.firstname, u.lastname, u.universityid, un.university, c.interest
            ORDER BY 
                p.last_update_timestamp DESC
            LIMIT 
                ?`;
        
        const [results] = await pool.query(query, [numberOfPosts]);
        return results;
    } catch (error) {
        console.error("SQL Error: ", error.message);
        throw error;
    }
};

//Get the latest creation posts
const getEnhancedLatestCreationPosts = async (numberOfPosts) => {
    try {
        const query = `
            SELECT 
                p.postid, p.userid, p.create_timestamp, p.last_update_timestamp, p.interestid, 
                p.header, p.description, p.visibility, p.active, 
                COUNT(DISTINCT l.like_userid) AS number_of_likes, 
                u.firstname, u.lastname, u.universityid, un.university, c.interest
            FROM 
                posts p
            LEFT JOIN 
                likes l ON p.postid = l.postid
            INNER JOIN 
                users u ON p.userid = u.userid
            INNER JOIN 
                universities un ON u.universityid = un.universityid
            INNER JOIN 
                interest c ON p.interestid = c.interestid
            WHERE 
                p.active = 1 AND p.visibility = 1
            GROUP BY 
                p.postid, u.firstname, u.lastname, u.universityid, un.university, c.interest
            ORDER BY 
                p.create_timestamp DESC
            LIMIT 
                ?`;
        
        const [results] = await pool.query(query, [numberOfPosts]);
        return results;
    } catch (error) {
        console.error("SQL Error: ", error.message);
        throw error;
    }
};

const getComments = async (postid) => {
    try {
        
        const query = "SELECT * FROM comments WHERE postid = ?";
        const [results] = await pool.query(query, [postid]);
        return results;
    } catch (error) {
        throw error;
    }
};


module.exports = {postComments, getInterests,addLikes, getLikes, getComments, getEnhancedLatestCreationPosts, getEnhancedLatestUpdatePosts, getEnhancedxPosts, getEnhancedRelatedPosts, getRelatedPosts, getPosts, getxPosts, getLatestCreationPosts, getLatestUpdatePosts, getEnhancedPosts}