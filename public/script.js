
// ====================================
// CYBERSHIELD - MAIN JAVASCRIPT
// ====================================


// ------------------------------------
// URL SCANNER
// ------------------------------------

const scanForm = document.getElementById("scanForm");
const urlInput = document.getElementById("urlInput");
const result = document.getElementById("scanResult");

if (scanForm && urlInput && result) {

    scanForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const url = urlInput.value.trim();

        if (!url) {
            result.className = "result-box warning";
            result.textContent = "Please enter a website address.";
            return;
        }

        try {
            const parsedURL = new URL(url);

            if (!["http:", "https:"].includes(parsedURL.protocol)) {
                throw new Error("Invalid protocol");
            }

        } catch {
            result.className = "result-box warning";
            result.textContent =
                "Please enter a valid HTTP or HTTPS website address.";
            return;
        }

        const analyseButton = scanForm.querySelector('button[type="submit"]');

        analyseButton.disabled = true;
        analyseButton.textContent = "Analysing website...";

        result.className = "result-box";
        result.textContent = "Checking available threat intelligence. Please wait...";

        try {

            const response = await fetch("/analyse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to analyse this URL.");
            }

            result.replaceChildren();

            const heading = document.createElement("strong");

            if (data.threat === true) {
                result.className = "result-box danger";
                heading.textContent = "⚠ Potential threat detected";

            } else if (data.queryStatus === "no_results") {
                result.className = "result-box success";
                heading.textContent = "✓ No known threat found";

            } else {
                result.className = "result-box warning";
                heading.textContent = "Scan inconclusive";
            }

            const message = document.createElement("p");
            message.textContent =
                data.message || "No additional information available.";

            result.append(heading, message);

            if (data.queryStatus === "no_results") {
                const note = document.createElement("p");
                note.textContent =
                    "This does not guarantee that the website is safe.";
                result.appendChild(note);
            }

            if (data.threat === true) {
                const note = document.createElement("p");
                note.textContent =
                    "Do not visit or share this link without further verification.";
                result.appendChild(note);
            }

        } catch (error) {

            result.className = "result-box warning";
            result.textContent =
                "Unable to complete scan: " + error.message;

        } finally {

            analyseButton.disabled = false;
            analyseButton.textContent = "Analyse Website →";

        }

    });

}


// ------------------------------------
// SECURITY CHECKUP
// ------------------------------------

const startCheckup = document.getElementById("startCheckup");
const checkupArea = document.getElementById("checkupArea");
const calculateScore = document.getElementById("calculateScore");
const scoreResult = document.getElementById("scoreResult");

if (startCheckup && checkupArea) {

    startCheckup.addEventListener("click", function () {

        checkupArea.hidden = false;

        checkupArea.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

}


if (calculateScore && scoreResult) {

    calculateScore.addEventListener("click", async function () {

        const answers = Array.from(
            document.querySelectorAll(".security-answer")
        ).map(answer => answer.checked);

        calculateScore.disabled = true;
        calculateScore.textContent = "Calculating score...";

        scoreResult.textContent = "Submitting your answers...";

        try {

            const response = await fetch("/api/security-checkup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ answers })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to calculate your score."
                );
            }

            const assessment = data.assessment;

            scoreResult.replaceChildren();

            const heading = document.createElement("h3");
            heading.textContent =
                `Your security practice score: ${assessment.score}/100`;

            const message = document.createElement("p");
            message.textContent = assessment.message;

            const count = document.createElement("p");
            count.textContent =
                `${assessment.checkedCount} out of ${assessment.totalQuestions} practices selected.`;

            const note = document.createElement("small");
            note.textContent =
                "This is an educational self-assessment, not a professional security audit.";

            scoreResult.append(heading, message, count, note);

            const recommendationHeading = document.createElement("h4");
            recommendationHeading.textContent = "Your recommended actions";

            scoreResult.appendChild(recommendationHeading);

            if (!assessment.recommendations ||
                assessment.recommendations.length === 0) {

                const completeMessage = document.createElement("p");
                completeMessage.textContent =
                    "Excellent! You selected all six security practices.";

                scoreResult.appendChild(completeMessage);

            } else {

                const list = document.createElement("ul");

                assessment.recommendations.forEach(recommendation => {

                    const item = document.createElement("li");
                    item.textContent = recommendation;

                    list.appendChild(item);

                });

                scoreResult.appendChild(list);

            }

            await loadDashboard();

        } catch (error) {

            scoreResult.textContent =
                "Unable to complete your assessment: " + error.message;

        } finally {

            calculateScore.disabled = false;
            calculateScore.textContent = "Calculate my score →";

        }

    });

}


// ------------------------------------
// DASHBOARD
// ------------------------------------

async function loadDashboard() {

    try {

        const response = await fetch("/api/dashboard");

        if (!response.ok) {
            throw new Error("Unable to load dashboard.");
        }

        const data = await response.json();
        const assessment = data.latestAssessment;

        if (!assessment) {
            return;
        }

        const scoreDisplay = document.getElementById("dashboardScore");
        const statusDisplay = document.getElementById("dashboardStatus");
        const recommendationsDisplay =
            document.getElementById("dashboardRecommendations");

        if (scoreDisplay) {
            scoreDisplay.textContent = `${assessment.score} / 100`;
        }

        if (statusDisplay) {
            statusDisplay.textContent =
                assessment.status || "Assessment completed";
        }

        if (recommendationsDisplay &&
            Array.isArray(assessment.recommendations)) {

            recommendationsDisplay.replaceChildren();

            assessment.recommendations.forEach(recommendation => {

                const item = document.createElement("li");
                item.textContent = recommendation;

                recommendationsDisplay.appendChild(item);

            });

            if (assessment.recommendations.length === 0) {
                const item = document.createElement("li");
                item.textContent = "Excellent! All six practices are selected.";
                recommendationsDisplay.appendChild(item);
            }

        }

    } catch (error) {

        console.error("Dashboard loading error:", error);

    }

}


// ------------------------------------
// NAVIGATION HIGHLIGHT
// ------------------------------------

const navLinks = document.querySelectorAll(".main-nav a");

navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.forEach(item => item.classList.remove("active"));

        link.classList.add("active");

    });

});


// ------------------------------------
// LOAD SAVED DASHBOARD INFORMATION
// ------------------------------------

loadDashboard();
