let currentQuestion = 0;
const userResponses = {};
const questions = [
    { q: "What are your interests?", options: ["Gaming", "Music", "Books", "Fitness", "Coding", "Travel", "Anime", "Fashion", "Photography", "Food"] },
    { q: "What type of subreddits do you visit?", options: ["Memes", "Technology", "Science", "Movies", "Art", "Sports", "Anime", "Relationships", "True Crime", "Self-Improvement"] },
    { q: "Are you an introvert or extrovert?", options: ["Introvert", "Extrovert", "Ambivert"] },
    { q: "What kind of person do you prefer as a match?", options: ["Introvert", "Extrovert", "Ambivert", "No Preference"] },
    { q: "What kind of conversations do you enjoy?", options: ["Deep Talks", "Casual Chat", "Jokes & Memes", "Debates", "Random Fun Facts", "Movie/TV Show Discussions"] },
    { q: "What is your favorite way to spend free time?", options: ["Watching Shows", "Gaming", "Reading", "Hanging Out with Friends", "Listening to Music", "Going Outside"] },
    { q: "What's your favorite type of music?", options: ["Pop", "Rock", "Hip-Hop/Rap", "Indie", "Electronic", "K-Pop", "Classical", "Metal", "Lo-Fi"] },
    { q: "Do you prefer single-player or multiplayer games?", options: ["Single-player", "Multiplayer", "Both", "Not into gaming"] },
    { q: "Which movie genre do you like most?", options: ["Action", "Comedy", "Romance", "Horror", "Sci-Fi", "Fantasy", "Drama", "Mystery"] },
    { q: "Which social media platform do you use the most?", options: ["Reddit", "Instagram", "TikTok", "Snapchat", "YouTube", "Twitter/X", "Discord", "Facebook", "I don’t use social media"] },
    { q: "How do you usually spend your weekends?", options: ["Hanging out with friends", "Gaming", "Watching movies/shows", "Studying", "Sleeping", "Going outside", "Sports", "Hobbies"] },
    { q: "Are you more of a morning person or night owl?", options: ["Morning Person", "Night Owl", "Depends on the day"] },
    { q: "What’s your dream vacation?", options: ["Beach Resort", "Mountains & Hiking", "Big City Adventure", "Theme Park", "Road Trip", "Cozy Cabin Getaway"] },
    { q: "What kind of humor do you enjoy?", options: ["Dark Humor", "Dad Jokes", "Sarcasm", "Goofy & Absurd", "Wholesome", "Memes"] },
    { q: "What's your go-to comfort food?", options: ["Pizza", "Burgers", "Pasta", "Ice Cream", "Tacos", "Fried Chicken", "Chocolate", "Ramen"] },
    { q: "Would you rather have a pet dog or cat?", options: ["Dog", "Cat", "Both", "Neither", "Exotic Pet (e.g., Snake, Parrot, Hamster)"] },
    { q: "What’s your ideal way to relax?", options: ["Listening to Music", "Watching a Show", "Sleeping", "Reading", "Going for a Walk", "Drawing or Writing", "Gaming"] },
    { q: "Which do you prefer?", options: ["Marvel", "DC", "Both", "Neither"] },
    { q: "What’s your go-to way to deal with stress?", options: ["Music", "Gaming", "Talking to Someone", "Sleeping", "Exercise", "Journaling", "Memes"] },
    { q: "Would you rather be famous online or successful in your career?", options: ["Famous Online", "Successful in Career", "Both", "Neither"] },
    { q: "What’s your favorite type of TV show?", options: ["Sitcoms", "Reality Shows", "Anime", "Drama", "Crime/Thriller", "Sci-Fi/Fantasy", "Horror", "Action"] }
];

function startQuiz() {
    document.getElementById("form-container").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestion >= questions.length) {
        saveUserData();
        return;
    }
    
    document.getElementById("question").innerText = questions[currentQuestion].q;
    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";
    
    questions[currentQuestion].options.forEach(option => {
        const btn = document.createElement("button");
        btn.classList.add("btn", "option-btn");
        btn.innerText = option;
        btn.onclick = () => toggleSelection(option);
        optionsDiv.appendChild(btn);
    });

    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Next";
    nextBtn.classList.add("btn", "next-btn");
    nextBtn.onclick = nextQuestion;
    optionsDiv.appendChild(nextBtn);
}

function toggleSelection(option) {
    const selectedOptions = userResponses[questions[currentQuestion].q] || [];
    
    if (selectedOptions.includes(option)) {
        userResponses[questions[currentQuestion].q] = selectedOptions.filter(item => item !== option);
    } else {
        selectedOptions.push(option);
        userResponses[questions[currentQuestion].q] = selectedOptions;
    }

    document.querySelectorAll(".option-btn").forEach(btn => {
        if (userResponses[questions[currentQuestion].q]?.includes(btn.innerText)) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });
}

function nextQuestion() {
    if (!userResponses[questions[currentQuestion].q] || userResponses[questions[currentQuestion].q].length === 0) {
        alert("Please select at least one option.");
        return;
    }

    currentQuestion++;
    loadQuestion();
}

function saveUserData() {
    const username = document.getElementById("username").value.trim();
    if (!username) {
        alert("Username required!");
        return;
    }

    const userData = { username, responses: userResponses };
    let storedData = localStorage.getItem("users") ? JSON.parse(localStorage.getItem("users")) : [];
    storedData.push(userData);
    localStorage.setItem("users", JSON.stringify(storedData));
    findMatches(userData);
}

function findMatches(userData) {
    document.getElementById("quiz-container").classList.add("hidden");
    document.getElementById("match-container").classList.remove("hidden");

    const storedData = JSON.parse(localStorage.getItem("users")) || [];
    let matches = storedData.filter(user => user.username !== userData.username);

    matches = matches.map(match => {
        let score = 0;
        Object.keys(userData.responses).forEach(q => {
            if (match.responses[q]) {
                const commonAnswers = match.responses[q].filter(ans => userData.responses[q].includes(ans));
                score += commonAnswers.length;
            }
        });
        return { ...match, score };
    }).filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score);

    displayMatches(matches);
}

function displayMatches(matches) {
    const matchList = document.getElementById("match-list");
    matchList.innerHTML = matches.length === 0 ? "<p>No matches found.</p>" : "";
    
    matches.forEach(match => {
        const div = document.createElement("div");
        div.classList.add("match-card");
        div.innerHTML = `
            <h3>@${match.username}</h3>
            <p>Common Interests: ${match.responses["What are your interests?"]?.join(", ") || "Unknown"}</p>
            <a href="https://www.reddit.com/user/${match.username}" target="_blank" class="visit-profile">🔗 Visit Profile</a>
        `;
        matchList.appendChild(div);
    });
}
