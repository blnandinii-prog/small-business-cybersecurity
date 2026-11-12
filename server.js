
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/analyse", async (req, res) => {
    const enteredURL = req.body.url;

    if (!enteredURL) {
        return res.status(400).json({
            message: "Please provide a URL."
        });
    }

    try {
        const parsedURL = new URL(enteredURL);

        if (!["http:", "https:"].includes(parsedURL.protocol)) {
            return res.status(400).json({
                message: "Only HTTP and HTTPS URLs are accepted."
            });
        }

        const authKey = process.env.URLHAUS_AUTH_KEY;

        if (!authKey) {
            return res.status(500).json({
                message: "API key is missing. Check your .env file."
            });
        }

        const response = await fetch(
            "https://urlhaus-api.abuse.ch/v1/url/",
            {
                method: "POST",
                headers: {
                    "Auth-Key": authKey,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    url: enteredURL
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: "URLhaus API request failed."
            });
        }

        res.json({
            url: enteredURL,
            queryStatus: data.query_status,
            threat: data.query_status === "ok",
            message: data.query_status === "ok"
                ? "WARNING: URLhaus lists this URL as malicious."
                : data.query_status === "no_results"
                    ? "No matching malicious URL was found in URLhaus."
                    : "URLhaus returned an unexpected result."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to complete the URL lookup."
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
