# 🛡️ CyberShield – Small Business Cybersecurity

CyberShield is a web-based cybersecurity awareness and assessment project designed to help small businesses understand potential online threats and improve their basic security practices.

## 🚀 Features

- **URL Threat Scanner:** Analyse URLs using the URLhaus threat intelligence service.
- **Security Checkup:** Complete a six-question cybersecurity assessment.
- **Security Score:** Calculate a score out of 100 based on security practices.
- **Personalised Recommendations:** Display suggestions to improve cybersecurity.
- **Dashboard:** View the latest security assessment and status.
- **Assessment History:** Save and review previous security assessments.
- **Cybersecurity Learning:** Access educational information about online safety.

## 🛠️ Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- URLhaus API
- JSON file storage

## 💻 Getting Started

### Prerequisites

- Node.js installed
- npm installed
- A URLhaus API authentication key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/blnandinii-prog/small-business-cybersecurity.git
   ```

2. Open the project folder:

   ```bash
   cd small-business-cybersecurity
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root and add the URLhaus authentication variable required by `server.js`.

   **Never upload your `.env` file or share your API key.**

5. Start the application:

   ```bash
   node server.js
   ```

6. Open your browser and visit:

   http://localhost:3000

## 📁 Project Structure

```text
small-business-cybersecurity/
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── data/
│   └── security-data.json
├── server.js
├── package.json
├── .gitignore
└── README.md
```

Note: The `data/` folder contains local assessment records and is excluded from the public repository.

## 📈 Development Progress

### 24 November 2026

- Fixed and verified the dashboard API response.
- Implemented persistent security assessment storage.
- Added an assessment history API endpoint.
- Verified saved assessment results and recommendations.
- Updated frontend JavaScript to match the HTML structure.
- Updated Git ignore rules to protect private configuration and local data.
- Uploaded the latest project changes to GitHub.

## 🔮 Future Improvements

- Improve URL threat classification.
- Test URLhaus authentication and scanner responses.
- Improve error handling and input validation.
- Refine the user interface and scan-result presentation.
- Improve mobile responsiveness.
- Add automated testing.

## ⚠️ Disclaimer

CyberShield is an educational project intended to demonstrate basic cybersecurity awareness and assessment features. It is not a replacement for a professional cybersecurity audit. Scanner results should not be treated as a guarantee that a website is safe.

## 👩‍💻 Project Status

Development is ongoing.