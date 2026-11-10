
const button = document.getElementById("analyseButton");
const input = document.getElementById("urlInput");
const result = document.getElementById("result");

button.addEventListener("click", async function () {

    const enteredURL = input.value.trim();

    if (enteredURL === "") {
        result.textContent = "Please enter a URL first.";
        return;
    }

    try {
        const parsedURL = new URL(enteredURL);

        if (
            parsedURL.protocol !== "http:" &&
            parsedURL.protocol !== "https:"
        ) {
            result.textContent = "Please enter a valid HTTP or HTTPS URL.";
            return;
        }

        result.textContent = "Sending URL to the backend...";

        const response = await fetch("http://localhost:3000/analyse", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: enteredURL
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong.");
        }

        result.textContent =
            "Backend response: " + data.message +
            " | URL: " + data.url;

    } catch (error) {
        result.textContent = "Error: " + error.message;
    }

});
