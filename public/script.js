
const urlInput = document.getElementById("urlInput");
const analyseButton = document.getElementById("analyseButton");
const result = document.getElementById("result");

analyseButton.addEventListener("click", async () => {
    const enteredURL = urlInput.value.trim();

    if (!enteredURL) {
        result.textContent = "Please enter a URL to analyse.";
        return;
    }

    let parsedURL;

    try {
        parsedURL = new URL(enteredURL);

        if (!["http:", "https:"].includes(parsedURL.protocol)) {
            throw new Error("Only HTTP and HTTPS URLs are accepted.");
        }
    } catch (error) {
        result.textContent = error.message === "Invalid URL"
            ? "Please enter a valid URL, including https://"
            : error.message;
        return;
    }

    analyseButton.disabled = true;
    analyseButton.textContent = "Analysing...";
    result.textContent = "Checking URL against the URLhaus threat database...";

    try {
        const response = await fetch("/analyse", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: parsedURL.href
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong.");
        }

        if (data.threat) {
            result.textContent =
                "HIGH RISK: " + data.message;
        } else if (data.queryStatus === "no_results") {
            result.textContent =
                "NO MATCH FOUND: " + data.message +
                " This does not guarantee that the URL is safe.";
        } else {
            result.textContent = data.message;
        }

    } catch (error) {
        result.textContent = "Error: " + error.message;
    } finally {
        analyseButton.disabled = false;
        analyseButton.textContent = "Analyse URL";
    }
});
