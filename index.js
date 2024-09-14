const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require("dotenv");
const path = require("path");

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(express.static("views"));

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

// MongoDB connection
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.irkqxhc.mongodb.net/registrationForm`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// MongoDB schema and models
const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const Registration = mongoose.model("Registration", registrationSchema);

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate password strength (for example, length >= 6 characters)
        if (password.length < 6) {
          return res.render('passwordPopup', { message: "Password must be at least 6 characters long." });
      }

        const existingUser = await Registration.findOne({ email: email });

        if (!existingUser) {
            const registrationData = new Registration({
                name,
                email,
                password
            });
            await registrationData.save();
            res.redirect("/login");
        } else {
            console.log("User already exists!");
        }
    } catch (error) {
        console.log(error);
    }
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Assuming you have a login route to handle user authentication
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Registration.findOne({ email: email });

        if (user && user.password === password) {
            // Authentication successful, redirect to main page
            // res.redirect(`/main?username=${user.name}`);
        } else {
            // Authentication failed, redirect back to login page
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error);
        // Handle error
        res.redirect("/login");
    }
});

app.get("/main", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "main.html"));
});

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Hi"}],
      },
      {
        role: "model",
        parts: [{ text: "Hello there! How can I assist you today?"}],
      },
      {
        role: "user",
        parts: [{ text: "2+3"}],
      },
      {
        role: "model",
        parts: [{ text: "2 + 3 = 5"}],
      },
      {
        role:"user",
        parts: [{text: "story"}],
      },
      {
        role: "model",
        parts: [{text: "Once upon a time..."}],
      },
      {
        role:"user",
        parts: [{text: "code in python"}],
      },
      {
        role: "model",
        parts: [{text: "print('Hello, world!')\n"}],
      },
      {
        role:"user",
        parts: [{text: "who are you"}],
      },
      {
        role: "model",
        parts: [{text: "I am TechXpert! Ready to help you anytime buddy."}],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  let response = result.response.text();

  // Check if the user input contains a request to print code
  if (userInput.toLowerCase().includes('code') && response) {
    // Format the code with proper indentation and coloring
    response = `<pre style="color: #ffffff; background-color: #242424; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${response}</pre>`;
  }

  return response;
}

app.get('/chatbot', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "chatbot.html"));
});

app.post('/chatbot', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/quiz/c", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "quizC.html"));
});
app.get("/videos/c", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "video_c.html"));
});
app.get("/cheatsheet/c", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "cheat_c.html"));
});
app.get("/cheatsheet", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "cheatsheet.html"));
});
app.get("/notes/c", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "cNotes.html"));
});

app.get("/quiz/python", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "quizPython.html"));
});
app.get("/videos/python", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "video_python.html"));
});
app.get("/cheatsheet/python", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "cheat_python.html"));
});
app.get("/notes/python", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "pythonNotes.html"));
});

app.get("/quiz/java", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "quizJava.html"));
});
app.get("/videos/java", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "video_c.html"));
});
app.get("/cheatsheet/java", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "cheat_java.html"));
});
app.get("/notes/java", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "javaNotes.html"));
});

app.get("/quiz/html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "quizHTML.html"));
});
app.get("/videos/html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "video_html.html"));
});
app.get("/cheatsheet/html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "cheat_html.html"));
});
app.get("/notes/html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "htmlNotes.html"));
});

app.get("/quiz/css", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "quizC.html"));
});
app.get("/videos/css", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "video_c.html"));
});
app.get("/cheatsheet/css", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "cheat_css3.html"));
});
app.get("/notes/css", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "cssNotes.html"));
});

app.get("/quiz/javascript", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "quizJavascript.html"));
});
app.get("/videos/javascript", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "video_js.html"));
});
app.get("/cheatsheet/javascript", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "cheat_javascript.html"));
});
app.get("/notes/javascript", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "jsNotes.html"));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


app.get("/cheatsheet", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "cheatsheet.html"));
});