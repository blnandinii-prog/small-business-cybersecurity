
require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const port = 3000;

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "security-data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ------------------------------------
// DATA STORAGE
// ------------------------------------

async function readSecurityData() {
    try {
        const file = await fs.readFile(DATA_FILE, "utf8");
        const data = JSON.parse(file);

        return {
            latestAssessment: data.latestAssessment || null,
            assessmentHistory: Array.isArray(data.assessmentHistory)
                ? data.assessmentHistory
                : []
        };

    } catch (error) {
        if (error.code === "ENOENT") {
            return {
                latestAssessment: null,
                assessmentHistory: []
            };
        }

        throw error;
    }
}

async function saveSecurityData(data) {
    await fs.mkdir(DATA_DIR, { recursive: true });

    await fs.writeFile(
        DATA_FILE,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

// ------------------------------------
// URL SCANNER
// ------------------------------------

app.post("/analyse", async (req, res) => {
    const enteredURL = req.body.url;

    if (!enteredURL || typeof enteredURL !== "string") {
        return res.status(400).json({
            message: "Please provide a valid URL."
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
        console.error("URL scan error:", error);

        res.status(500).json({
            message: "Unable to complete the URL lookup."
        });
    }
});

// ------------------------------------
// SECURITY CHECKUP
// ------------------------------------

const securityQuestions = [
    {
        title: "Strong passwords",
        recommendation: "Use strong, unique passwords for business accounts."
    },
    {
        title: "Two-factor authentication",
        recommendation: "Enable two-factor authentication on important accounts."
    },
    {
        title: "Data backups",
        recommendation: "Create regular backups of important business data."
    },
    {
        title: "Software updates",
        recommendation: "Keep your software and devices updated."
    },
    {
        title: "Employee awareness",
        recommendation: "Train employees to recognise phishing and suspicious links."
    },
    {
        title: "Access control",
        recommendation: "Restrict access to sensitive business information."
    }
];

function getSecurityStatus(score) {
    if (score >= 80) return "Good";
    if (score >= 50) return "Moderate";
    return "At Risk";
}

app.post("/api/security-checkup", async (req, res) => {
    try {
        const answers = req.body.answers;

        if (
            !Array.isArray(answers) ||
            answers.length !== securityQuestions.length ||
            !answers.every(answer => typeof answer === "boolean")
        ) {
            return res.status(400).json({
                message: "Please submit answers to all six security questions."
            });
        }

        const checkedCount = answers.filter(Boolean).length;

        const score = Math.round(
            (checkedCount / securityQuestions.length) * 100
        );

        let message;

        if (score >= 80) {
            message = "Great progress! Continue maintaining your security practices.";
        } else if (score >= 50) {
            message = "Good start! There are still some areas you can improve.";
        } else {
            message = "Your business should prioritise improving its cybersecurity practices.";
        }

        const recommendations = securityQuestions
            .filter((question, index) => !answers[index])
            .map(question => question.recommendation);

        const assessment = {
            id: Date.now().toString(),
            score,
            status: getSecurityStatus(score),
            checkedCount,
            totalQuestions: securityQuestions.length,
            message,
            recommendations,
            completedAt: new Date().toISOString()
        };

        const securityData = await readSecurityData();

        // Save every assessment
        securityData.assessmentHistory.unshift(assessment);

        // Keep the latest 50 assessments
        securityData.assessmentHistory =
            securityData.assessmentHistory.slice(0, 50);

        securityData.latestAssessment = assessment;

        await saveSecurityData(securityData);

        res.json({
            success: true,
            message: "Security assessment completed successfully.",
            assessment
        });

    } catch (error) {
        console.error("Security checkup error:", error);

        res.status(500).json({
            message: "Unable to save your security assessment."
        });
    }
});

// ------------------------------------
// DASHBOARD DATA
// ------------------------------------

app.get("/api/dashboard", async (req, res) => {
    try {
        const securityData = await readSecurityData();

        res.json({
            latestAssessment: securityData.latestAssessment
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Unable to load dashboard information."
        });
    }
});

// ------------------------------------
// ASSESSMENT HISTORY
// ------------------------------------

app.get("/api/assessment-history", async (req, res) => {
    try {
        const securityData = await readSecurityData();

        res.json({
            success: true,
            total: securityData.assessmentHistory.length,
            assessments: securityData.assessmentHistory
        });

    } catch (error) {
        console.error("Assessment history error:", error);

        res.status(500).json({
            message: "Unable to load assessment history."
        });
    }
});

// ------------------------------------
// START SERVER
// ------------------------------------

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
