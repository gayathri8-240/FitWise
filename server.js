// server.js
require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { db, initDb } = require("./db");
const { authRequired } = require("./auth");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB (creates tables if not exist)
initDb();

/* -----------------------------
   BMI Category Helper
------------------------------ */
function bmiCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal Weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/* -----------------------------
   Health recommendations data
   (kept from your existing code)
------------------------------ */
const healthRecommendations = {
  underweight: {
    emoji: "📉",
    category: "Underweight",
    color: "#3498db",
    info: "You are below healthy weight. Focus on gaining weight through nutritious foods and strength training.",
    diet: {
      "Protein-Rich Foods": [
        "🍗 Chicken and turkey (200-250g daily)",
        "🐟 Salmon and mackerel (2-3 times/week)",
        "🥚 Eggs (4-5 per day)",
        "🥛 Milk and yogurt (2 cups daily)",
        "🌰 Nuts and nut butters",
      ],
      "Calorie-Dense Foods": [
        "🥑 Avocados (1 per day)",
        "🍌 Bananas and dried fruits",
        "🧈 Olive and coconut oil",
        "🍞 Whole wheat bread and pasta",
        "🥜 Beans and legumes",
      ],
    },
    exercises: [
      { title: "Weight Training for Beginners", duration: "30 mins", description: "Build muscle mass effectively", url: "https://www.youtube.com/results?search_query=beginner+weight+training+30+minutes" },
      { title: "Compound Exercises at Home", duration: "25 mins", description: "Squats, deadlifts, push-ups", url: "https://www.youtube.com/results?search_query=compound+exercises+home+workout" },
      { title: "Resistance Band Workout", duration: "20 mins", description: "Build muscle using bands", url: "https://www.youtube.com/results?search_query=resistance+band+workout" },
    ],
    tips: [
      "Aim to gain 0.5-1 kg per week",
      "Combine cardio (2 days) with strength training (3-4 days)",
      "Eat 5-6 meals daily",
      "Sleep 8-9 hours for recovery",
      "Drink 3-4 liters of water",
    ],
  },
  normal: {
    emoji: "✅",
    category: "Normal Weight",
    color: "#27ae60",
    info: "Great! You have a healthy weight. Maintain this with balanced diet and regular exercise.",
    diet: {
      Proteins: ["🍗 Lean meats (150g per meal)", "🐟 Fish (2-3 times/week)", "🥚 Eggs (2-3 per day)", "🧀 Low-fat dairy", "🫘 Legumes and beans"],
      "Vegetables & Fruits": ["🥦 Broccoli and spinach (daily)", "🥕 Carrots and sweet potatoes", "🍎 Apples and berries (2 servings)", "🍊 Citrus fruits", "🥬 Leafy greens"],
    },
    exercises: [
      { title: "Full Body Workout", duration: "45 mins", description: "Cardio and strength combined", url: "https://www.youtube.com/results?search_query=full+body+workout+45+minutes+home" },
      { title: "HIIT Training", duration: "20 mins", description: "High intensity interval training", url: "https://www.youtube.com/results?search_query=hiit+workout+20+minutes+at+home" },
      { title: "Yoga for Health", duration: "30 mins", description: "Flexibility and strength", url: "https://www.youtube.com/results?search_query=yoga+30+minutes+for+beginners" },
    ],
    tips: ["Exercise 150 minutes per week", "Combine cardio and strength training", "Eat balanced meals", "Drink 2-3 liters water daily", "Get 7-8 hours of sleep"],
  },
  overweight: {
    emoji: "⚠️",
    category: "Overweight",
    color: "#f39c12",
    info: "You are above healthy weight. Start gradual changes in diet and exercise.",
    diet: {
      "High-Protein Foods": ["🍗 Grilled chicken breast (200g)", "🐟 White fish (150-200g)", "🥚 Egg whites (5-6 daily)", "🧈 Greek yogurt (low-fat)", "🫘 Lentils and chickpeas"],
      Vegetables: ["🥦 Broccoli, cauliflower", "🥒 Cucumber and zucchini (unlimited)", "🥬 Spinach and kale", "🍅 Tomatoes", "🧅 Onions and garlic"],
    },
    exercises: [
      { title: "Walking for Weight Loss", duration: "45 mins", description: "Brisk walking burns calories", url: "https://www.youtube.com/results?search_query=brisk+walking+weight+loss+45+minutes" },
      { title: "Beginner Cardio", duration: "20 mins", description: "Low-impact cardio", url: "https://www.youtube.com/results?search_query=beginner+cardio+20+minutes+at+home" },
      { title: "Pilates for Fat Loss", duration: "30 mins", description: "Core and fat burning", url: "https://www.youtube.com/results?search_query=pilates+fat+loss+30+minutes" },
    ],
    tips: ["Create calorie deficit of 500-750/day", "Lose 0.5-1 kg per week", "Exercise 200-300 min per week", "Track food intake daily", "Increase water to 3-4 liters"],
  },
  obese: {
    emoji: "🚨",
    category: "Obese",
    color: "#e74c3c",
    info: "Your health is at risk. Consult a doctor and begin a gradual weight loss program.",
    diet: {
      "Essential Foods": ["🍗 Lean proteins (grilled)", "🥕 Vegetables (eat plenty)", "🍎 Fruits (2-3 servings)", "🥛 Low-fat milk and yogurt", "🍞 Whole grains"],
      "Daily Habits": ["💧 Drink water before meals", "🥗 Eat salads with meals", "🍽️ Use smaller plates", "⏰ Eat slowly (20+ mins)", "📱 Track every calorie"],
    },
    exercises: [
      { title: "Walking for Beginners", duration: "30 mins", description: "Low-impact start", url: "https://www.youtube.com/results?search_query=walking+exercise+for+obese+beginners+30+minutes" },
      { title: "Seated Exercises", duration: "20 mins", description: "Safe exercises sitting", url: "https://www.youtube.com/results?search_query=seated+exercises+weight+loss" },
      { title: "Gentle Stretching", duration: "15 mins", description: "Flexibility exercises", url: "https://www.youtube.com/results?search_query=gentle+stretching+exercises" },
    ],
    tips: ["⚠️ CONSULT YOUR DOCTOR FIRST", "Start with 10-15 min daily", "Gradually increase duration", "Join a support group", "Aim for 1 kg loss per week", "Keep a food diary", "Celebrate small wins"],
  },
};

/* ===============================
   AUTH ROUTES
   =============================== */

app.post("/auth/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "fullName, email, password required" });
  }

  try {
    const hash = await bcrypt.hash(password, 12);

    db.run(
      `INSERT INTO users(full_name, email, password_hash) VALUES(?, ?, ?)`,
      [fullName, email.toLowerCase(), hash],
      function (err) {
        if (err) {
          if (String(err).includes("UNIQUE")) {
            return res.status(409).json({ error: "Email already exists" });
          }
          return res.status(500).json({ error: "DB error" });
        }
        return res.status(201).json({ id: this.lastID, email: email.toLowerCase() });
      }
    );
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  db.get(
    `SELECT id, full_name, email, password_hash FROM users WHERE email = ?`,
    [email.toLowerCase()],
    async (err, user) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: { id: user.id, fullName: user.full_name, email: user.email },
      });
    }
  );
});

/* ===============================
   BMI DB ROUTES (Protected)
   =============================== */

// Save a BMI entry for the logged-in user
app.post("/bmi", authRequired, (req, res) => {
  const { heightCm, weightKg, notes } = req.body;

  const h = Number(heightCm);
  const w = Number(weightKg);

  if (!h || !w || h <= 0 || w <= 0) {
    return res.status(400).json({ error: "Invalid height/weight" });
  }

  const bmi = w / Math.pow(h / 100, 2);
  const category = bmiCategory(bmi);

  db.run(
    `INSERT INTO bmi_entries(user_id, height_cm, weight_kg, bmi, category, notes)
     VALUES(?, ?, ?, ?, ?, ?)`,
    [req.user.id, h, w, bmi, category, notes || null],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });

      return res.status(201).json({
        id: this.lastID,
        bmi: Number(bmi.toFixed(2)),
        category,
      });
    }
  );
});

// Get BMI history (latest 50) for the logged-in user
app.get("/bmi/history", authRequired, (req, res) => {
  db.all(
    `SELECT id,
            height_cm AS heightCm,
            weight_kg AS weightKg,
            bmi,
            category,
            notes,
            created_at AS createdAt
     FROM bmi_entries
     WHERE user_id = ?
     ORDER BY datetime(created_at) DESC
     LIMIT 50`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });

      const items = rows.map((r) => ({
        ...r,
        bmi: Number(Number(r.bmi).toFixed(2)),
      }));

      return res.json({ items });
    }
  );
});

/* ===============================
   EMAIL ROUTE (kept)
   =============================== */

app.post("/send-bmi-email", async (req, res) => {
  const { email, bmi, category, name } = req.body;

  try {
    // IMPORTANT: Put these in .env (GMAIL_USER, GMAIL_APP_PASSWORD)
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      return res.status(500).json({
        success: false,
        error: "Missing email config. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // Map category to key in healthRecommendations
    let key = "normal";
    if (category === "Underweight") key = "underweight";
    else if (category === "Normal Weight") key = "normal";
    else if (category === "Overweight") key = "overweight";
    else if (category === "Obese") key = "obese";

    const recommendation = healthRecommendations[key];

    // Build diet HTML
    let dietHtml = "";
    for (const [dietCat, foods] of Object.entries(recommendation.diet)) {
      dietHtml += `<h4>${dietCat}</h4><ul>`;
      foods.forEach((f) => {
        dietHtml += `<li>${f}</li>`;
      });
      dietHtml += `</ul>`;
    }

    // Build exercises HTML
    let exercisesHtml = "<ul>";
    recommendation.exercises.forEach((e) => {
      exercisesHtml += `<li><strong>${e.title}</strong> (${e.duration}) - ${e.description} <a href="${e.url}" target="_blank">Watch</a></li>`;
    });
    exercisesHtml += "</ul>";

    // Build tips HTML
    let tipsHtml = "<ul>";
    recommendation.tips.forEach((t) => {
      tipsHtml += `<li>${t}</li>`;
    });
    tipsHtml += "</ul>";

    const mailOptions = {
      from: gmailUser,
      to: email,
      subject: "🏥 FitWise - Your Personalized BMI Result & Recommendations",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="background-color: #c44569; color: white; padding: 20px; text-align: center;">
              <h1>FitWise</h1>
              <p>Your Health Companion</p>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #c44569;">Hello ${name || ""}!</h2>
              <p>Your BMI is <strong style="color:${recommendation.color}; font-size:24px;">${bmi}</strong> (${category})</p>

              <h3>${recommendation.emoji} Personalized Recommendations</h3>

              <h4>🍎 Diet Plan</h4>
              ${dietHtml}

              <h4>🏋️ Exercises</h4>
              ${exercisesHtml}

              <h4>💡 Tips</h4>
              ${tipsHtml}

              <p style="margin-top: 20px;">Stay healthy and keep tracking your fitness goals! 💪</p>
            </div>
            <div style="background-color: #c44569; color: white; padding: 15px; text-align: center;">
              <p>FitWise - © 2025 All Rights Reserved</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   SERVER START
   =============================== */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
