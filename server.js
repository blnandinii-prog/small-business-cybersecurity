
const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

// Allow the backend to receive JSON data
app.use(express.json());

// Serve the website from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Receive a URL from the frontend
app.post("/analyse", (req, res) => {
    const enteredURL = req.body.url;

    if (!enteredURL) {
        return res.status(400).json({
            message: "Please provide a URL."
        });
    }

    res.json({
        message: "URL successfully received by the backend!",
        url: enteredURL,
        status: "Ready for security analysis"
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
