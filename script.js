// UPDATED script.js (DB users + BMI history via your Node backend on :3000)

const API_BASE = "http://localhost:3000";

let currentUser = null;
let currentUserSession = JSON.parse(localStorage.getItem("fitwise_session")) || null;

/* ===============================
   AUTH TOKEN HELPERS
   =============================== */
function setToken(token) {
  localStorage.setItem("tbmi_token", token);
}
function getToken() {
  return localStorage.getItem("tbmi_token");
}
function clearToken() {
  localStorage.removeItem("tbmi_token");
}
function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ===============================
   BMI Recommendations (unchanged)
   =============================== */
const bmiRecommendations = {
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

const continentDiet = {
  asia: {
    underweight: [
      "🥘 Rice + lentils (dal) with ghee",
      "🥛 Full-fat milk/curd + nuts",
      "🥜 Peanuts, cashews, sesame laddoo",
      "🍗 Chicken/fish curry + rice",
      "🍌 Banana + dates + peanut butter"
    ],
    normal: [
      "🍛 Balanced rice/roti + vegetables",
      "🐟 Fish / lean chicken / paneer",
      "🥗 Mixed veg curries + salad",
      "🥣 Idli/dosa/upma in moderate portions",
      "🚫 Limit fried snacks + sugary tea"
    ],
    overweight: [
      "🥗 More vegetables + soups (rasam/veg soup)",
      "🐟 Grilled fish/tofu/paneer (less oil)",
      "🍚 Reduce white rice; prefer brown rice/millets",
      "🫘 Lentils/beans for protein + fiber",
      "🚫 Avoid deep-fried snacks & sweets"
    ],
    obese: [
      "🥗 High-fiber veggies (greens, gourds, sprouts)",
      "🍗 Lean protein + salad (low oil)",
      "🥣 Millets (ragi/bajra/jowar) instead of refined carbs",
      "🍵 Unsweetened tea/green tea; more water",
      "🚫 Avoid sugary drinks, sweets, fried foods"
    ]
  },

  africa: {
    underweight: [
      "🍚 Jollof rice / rice + beans (larger portions)",
      "🥜 Groundnut (peanut) soup/stew",
      "🍗 Chicken/goat stew + yam/plantain",
      "🥑 Avocado with meals",
      "🥛 Milk/yogurt + nuts"
    ],
    normal: [
      "🍲 Stews with vegetables + lean meat/fish",
      "🫘 Beans/lentils + whole grains",
      "🍌 Plantain in moderate portions",
      "🥗 Leafy greens (spinach, kale, sukuma wiki)",
      "🚫 Limit sugary drinks"
    ],
    overweight: [
      "🥗 More leafy greens + vegetable stews",
      "🐟 Grilled fish instead of fried fish",
      "🍠 Reduce fufu/ugali/yam portions; add more veggies",
      "🫘 Beans/lentils for filling protein",
      "🚫 Limit fried plantain + pastries"
    ],
    obese: [
      "🥗 Vegetables first (greens, okra, tomatoes)",
      "🐟 Lean protein (fish, chicken) grilled/boiled",
      "🍠 Smaller portions of staple starch (fufu/ugali/yam)",
      "💧 Water before meals; avoid sweetened drinks",
      "🚫 Avoid deep-fried foods & sugary snacks"
    ]
  },

  europe: {
    underweight: [
      "🥖 Whole grain bread + olive oil",
      "🧀 Cheese + yogurt + honey",
      "🐟 Salmon / tuna (healthy fats)",
      "🥔 Potatoes + eggs",
      "🥜 Nuts + dried fruits"
    ],
    normal: [
      "🥗 Mediterranean-style meals",
      "🐟 Fish 2x/week + lean meats",
      "🍞 Whole grains (oats, rye, brown bread)",
      "🥦 Vegetables daily + fruit",
      "🍷 Limit alcohol + desserts"
    ],
    overweight: [
      "🥗 Salads + lean protein (chicken/fish)",
      "🍞 Reduce bread/pasta portions",
      "🥣 Oats + berries for breakfast",
      "🥦 More vegetables, fewer processed foods",
      "🚫 Limit cheese-heavy & sugary foods"
    ],
    obese: [
      "🥗 Big veggie portions every meal",
      "🍗 Lean meats/fish; avoid sausages/processed meats",
      "🥣 Oats/whole grains in small portions",
      "🚶 30–45 min walking daily",
      "🚫 Avoid ultra-processed foods & sugary desserts"
    ]
  },

  north_america: {
    underweight: [
      "🥑 Avocado toast + eggs",
      "🥜 Peanut butter smoothies",
      "🍗 Chicken + brown rice + veggies",
      "🧀 Greek yogurt + granola",
      "🥔 Sweet potatoes + olive oil"
    ],
    normal: [
      "🥗 Balanced plate (protein + veg + carbs)",
      "🍗 Lean protein (chicken/turkey/fish)",
      "🥣 Oats + fruit breakfast",
      "🥦 Vegetables with every meal",
      "🚫 Limit fast food + soda"
    ],
    overweight: [
      "🥗 High-protein salads + light dressing",
      "🍗 Grilled chicken/fish; avoid fried",
      "🥔 Swap fries for sweet potato/veg",
      "🥤 Replace soda with water/zero sugar",
      "🚫 Cut down processed snacks"
    ],
    obese: [
      "🥗 Veggie-heavy meals + lean protein",
      "🥣 Low-sugar, high-fiber breakfast (oats/chia)",
      "🍗 Meal-prep to avoid fast food",
      "🚶 Daily walking + portion control",
      "🚫 Avoid sugary drinks, desserts, fried foods"
    ]
  },

  south_america: {
    underweight: [
      "🍚 Rice + beans (bigger portions)",
      "🥩 Beef/chicken + potatoes/yuca",
      "🥑 Avocado with meals",
      "🧀 Cheese + whole grain bread",
      "🍌 Banana + milk smoothie"
    ],
    normal: [
      "🍲 Beans/lentils + rice in balance",
      "🐟 Fish/chicken + vegetables",
      "🌽 Corn/arepas in moderate portions",
      "🥗 Salads + fruits",
      "🚫 Limit sugary pastries"
    ],
    overweight: [
      "🥗 More salads + grilled meats",
      "🍚 Reduce rice/arepa portions; add veggies",
      "🫘 Beans for protein + fiber",
      "🍎 Fruits instead of sweets",
      "🚫 Avoid fried empanadas often"
    ],
    obese: [
      "🥗 Big vegetable portions (salads, soups)",
      "🐟 Lean protein grilled/boiled",
      "🍚 Smaller portions of rice/arepa/yuca",
      "💧 Water + portion control",
      "🚫 Avoid fried foods & sugary desserts"
    ]
  },

  australia_oceania: {
    underweight: [
      "🥑 Avocado + eggs",
      "🐟 Salmon + rice/quinoa",
      "🥛 Full-fat dairy + nuts",
      "🥪 Whole grain sandwiches with protein",
      "🍌 Smoothies with peanut butter"
    ],
    normal: [
      "🥗 Balanced meals (veg + protein + carbs)",
      "🐟 Fish/lean meat + vegetables",
      "🥣 Oats + fruit breakfast",
      "🥦 Plenty of vegetables daily",
      "🚫 Limit takeout + sugary drinks"
    ],
    overweight: [
      "🥗 High-protein salads + veggies",
      "🐟 Grilled fish/chicken",
      "🍞 Reduce bread/pasta portions",
      "🥤 More water; fewer sweet drinks",
      "🚫 Cut snacks (chips, desserts)"
    ],
    obese: [
      "🥗 Veggie-first meals + lean protein",
      "🥣 High-fiber breakfast (oats/chia)",
      "🚶 Walk/swim regularly (low impact)",
      "🍽️ Portion control + meal planning",
      "🚫 Avoid processed foods & sugary drinks"
    ]
  }
};



/* ===============================
   ON LOAD: restore session
   =============================== */
window.addEventListener("load", function () {
  if (currentUserSession && getToken()) {
    currentUser = currentUserSession;
    showBMICalculator();
    // load history if UI has a place for it
    refreshHistorySafe();
  } else {
    // If token missing, force login
    clearToken();
    localStorage.removeItem("fitwise_session");
    currentUserSession = null;
    showLoginForm();
  }
});

/* ===============================
   UI Toggle / Show
   =============================== */
function toggleLoginForm() {
  document.getElementById("loginForm").classList.toggle("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("bmiCalculator").classList.add("hidden");
  clearLoginForm();
}

function toggleRegisterForm() {
  document.getElementById("registerForm").classList.toggle("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("bmiCalculator").classList.add("hidden");
  clearRegisterForm();
}

function showLoginForm() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("bmiCalculator").classList.add("hidden");
}

function showRegisterForm() {
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("bmiCalculator").classList.add("hidden");
}

function showBMICalculator() {
  document.getElementById("bmiCalculator").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("authButtons").classList.add("hidden");
  document.getElementById("userButtons").classList.remove("hidden");
  document.getElementById("currentUser").textContent = currentUser.name || currentUser.fullName || "User";
}

/* ===============================
   Password strength (unchanged)
   =============================== */
function checkPasswordStrength() {
  const password = document.getElementById("registerPassword").value;
  const strengthDiv = document.getElementById("passwordStrength");
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  strengthDiv.classList.remove("weak", "medium", "strong");

  if (password.length === 0) {
    strengthDiv.style.display = "none";
  } else if (strength < 2) {
    strengthDiv.style.display = "block";
    strengthDiv.classList.add("weak");
    strengthDiv.textContent = "❌ Weak password";
  } else if (strength < 3) {
    strengthDiv.style.display = "block";
    strengthDiv.classList.add("medium");
    strengthDiv.textContent = "⚠️ Medium password";
  } else {
    strengthDiv.style.display = "block";
    strengthDiv.classList.add("strong");
    strengthDiv.textContent = "✓ Strong password";
  }
}

/* ===============================
   BACKEND AUTH CALLS
   =============================== */
async function apiRegister(fullName, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Register failed");
  return data;
}

async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data; // { token, user }
}

/* ===============================
   REGISTER (UPDATED to use DB)
   =============================== */
async function handleRegister() {
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;
  const agreeTerms = document.getElementById("agreeTerms").checked;
  const errorDiv = document.getElementById("registerError");
  const successDiv = document.getElementById("registerSuccess");

  errorDiv.style.display = "none";
  successDiv.style.display = "none";

  if (!name || !email || !password) {
    errorDiv.textContent = "❌ Please fill in all fields.";
    errorDiv.style.display = "block";
    return;
  }

  if (!validateEmail(email)) {
    errorDiv.textContent = "❌ Please enter a valid email address.";
    errorDiv.style.display = "block";
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = "❌ Password must be at least 6 characters long.";
    errorDiv.style.display = "block";
    return;
  }

  if (password !== confirmPassword) {
    errorDiv.textContent = "❌ Passwords do not match.";
    errorDiv.style.display = "block";
    return;
  }

  if (!agreeTerms) {
    errorDiv.textContent = "❌ You must agree to the Terms of Service.";
    errorDiv.style.display = "block";
    return;
  }

  try {
    await apiRegister(name, email, password);

    successDiv.textContent = "✓ Account created successfully! Redirecting to login...";
    successDiv.style.display = "block";

    setTimeout(() => {
      clearRegisterForm();
      showLoginForm();
    }, 1500);
  } catch (err) {
    errorDiv.textContent = `❌ ${err.message}`;
    errorDiv.style.display = "block";
  }
}

/* ===============================
   LOGIN (UPDATED to use DB + JWT)
   =============================== */
async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const rememberMe = document.getElementById("rememberMe").checked;
  const errorDiv = document.getElementById("loginError");

  errorDiv.style.display = "none";

  if (!email || !password) {
    errorDiv.textContent = "❌ Please enter both email and password.";
    errorDiv.style.display = "block";
    return;
  }

  try {
    const data = await apiLogin(email, password);

    // store token + session user
    setToken(data.token);

    // Your UI expects currentUser.name + currentUser.email
    currentUser = {
      name: data.user.fullName || data.user.full_name || "User",
      email: data.user.email,
    };

    localStorage.setItem("fitwise_session", JSON.stringify(currentUser));
    currentUserSession = currentUser;

    if (rememberMe) localStorage.setItem("fitwise_remember", email);

    clearLoginForm();
    showBMICalculator();
    refreshHistorySafe();
  } catch (err) {
    errorDiv.textContent = `❌ ${err.message}`;
    errorDiv.style.display = "block";
  }
}

/* ===============================
   LOGOUT (UPDATED)
   =============================== */
function logout() {
  currentUser = null;
  localStorage.removeItem("fitwise_session");
  currentUserSession = null;
  clearToken();

  document.getElementById("authButtons").classList.remove("hidden");
  document.getElementById("userButtons").classList.add("hidden");
  showLoginForm();
  clearLoginForm();
}

/* ===============================
   Helpers
   =============================== */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function clearLoginForm() {
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("rememberMe").checked = false;
  document.getElementById("loginError").style.display = "none";
}

function clearRegisterForm() {
  document.getElementById("registerName").value = "";
  document.getElementById("registerEmail").value = "";
  document.getElementById("registerPassword").value = "";
  document.getElementById("registerConfirmPassword").value = "";
  document.getElementById("agreeTerms").checked = false;
  document.getElementById("registerError").style.display = "none";
  document.getElementById("registerSuccess").style.display = "none";
  const ps = document.getElementById("passwordStrength");
  ps.classList.remove("weak", "medium", "strong");
  ps.style.display = "none";
}

/* ===============================
   BMI DB: save + history
   =============================== */
async function saveBmiToDb(heightCm, weightKg, notes = "") {
  const res = await fetch(`${API_BASE}/bmi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ heightCm, weightKg, notes }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Save BMI failed");
  return data;
}

async function loadBmiHistory() {
  const res = await fetch(`${API_BASE}/bmi/history`, {
    headers: { ...authHeaders() },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "History load failed");
  return data.items || [];
}

// This only runs if your HTML has #historyList (safe)
function renderHistory(items) {
  const el = document.getElementById("historyList");
  if (!el) return;

  if (!items || items.length === 0) {
    el.innerHTML = "<p>No history yet.</p>";
    return;
  }

  el.innerHTML = items
    .map(
      (x) => `
      <div style="padding:10px;border:1px solid #ddd;border-radius:8px;margin:8px 0;">
        <div><b>${Number(x.bmi).toFixed(2)}</b> (${x.category})</div>
        <div>Height: ${x.heightCm} cm | Weight: ${x.weightKg} kg</div>
        <div style="font-size:12px;color:#666;">${x.createdAt}</div>
        ${x.notes ? `<div>Notes: ${x.notes}</div>` : ""}
      </div>
    `
    )
    .join("");
}

async function refreshHistorySafe() {
  try {
    if (!getToken()) return;
    const items = await loadBmiHistory();
    renderHistory(items);
  } catch (e) {
    // don’t block UI if history fails
    console.warn("History load failed:", e.message);
  }
}

/* ===============================
   BMI CALC (UPDATED to save DB + email)
   =============================== */
async function calculateBMI() {
  const weight = parseFloat(document.getElementById("weight").value);
  const height = parseFloat(document.getElementById("height").value);

  if (!weight || !height || weight <= 0 || height <= 0) {
    alert("Please enter valid weight and height values!");
    return;
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const bmiRounded = bmi.toFixed(1);

  let category, info, color, activeBar;

  if (bmi < 18.5) {
    category = "Underweight";
    info = "You may need to gain weight. Consult with a healthcare provider for guidance.";
    color = "#3498db";
    activeBar = "underweightBar";
  } else if (bmi >= 18.5 && bmi < 25) {
    category = "Normal Weight";
    info = "You have a healthy body weight. Keep up the good work!";
    color = "#27ae60";
    activeBar = "normalBar";
  } else if (bmi >= 25 && bmi < 30) {
    category = "Overweight";
    info = "You may want to consider losing some weight through diet and exercise.";
    color = "#f39c12";
    activeBar = "overweightBar";
  } else {
    category = "Obese";
    info = "Consider consulting with a healthcare provider about weight management.";
    color = "#e74c3c";
    activeBar = "obeseBar";
  }

  // View Recommendations button (unchanged)
  const viewBtn = document.getElementById("viewRecommendationsBtn");
  viewBtn.classList.remove("hidden");
  viewBtn.onclick = () => {
    displayRecommendations(bmiRounded, category);
  };

  // Display results (unchanged)
  document.getElementById("bmiValue").textContent = bmiRounded;
  document.getElementById("bmiValue").style.color = color;
  document.getElementById("bmiCategory").textContent = category;
  document.getElementById("bmiCategory").style.color = color;
  document.getElementById("bmiInfo").textContent = info;
  document.getElementById("result").classList.add("show");

  // Activate chart bar (unchanged)
  document.querySelectorAll(".chart-bar").forEach((bar) => bar.classList.remove("active"));
  document.getElementById(activeBar).classList.add("active");

  // 1) SAVE BMI TO DB (NEW)
  try {
    if (getToken()) {
      await saveBmiToDb(height, weight, "");
      refreshHistorySafe();
    }
  } catch (e) {
    console.warn("BMI save failed:", e.message);
    // Don’t alert user here unless you want to:
    // alert("❌ Could not save BMI history. Please login again.");
  }

  // 2) SEND BMI EMAIL (kept, same)
  if (currentUser && currentUser.email) {
    fetch(`${API_BASE}/send-bmi-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: currentUser.email,
        bmi: bmiRounded,
        category: category,
        name: currentUser.name,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) alert("✅ BMI sent to your email!");
        else alert("❌ Error sending email.");
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Error sending email.");
      });
  }
}

/* ===============================
   Reset / Alerts (unchanged)
   =============================== */
function resetPage() {
  if (currentUser) {
    document.getElementById("weight").value = "";
    document.getElementById("height").value = "";
    document.getElementById("result").classList.remove("show");
  } else {
    clearLoginForm();
    clearRegisterForm();
  }
}

function showAlert(title, message) {
  alert(title + ": " + message);
}

/* ===============================
   ENTER key handler (unchanged)
   =============================== */
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    if (!document.getElementById("loginForm").classList.contains("hidden")) {
      handleLogin();
    } else if (!document.getElementById("registerForm").classList.contains("hidden")) {
      handleRegister();
    } else if (!document.getElementById("bmiCalculator").classList.contains("hidden")) {
      calculateBMI();
    }
  }
});

/* ===============================
   Recommendations render (unchanged)
   =============================== */
function displayRecommendations(bmi, category) {
  let rec;
  
  if (category === "Underweight") rec = bmiRecommendations.underweight;
  else if (category === "Normal Weight") rec = bmiRecommendations.normal;
  else if (category === "Overweight") rec = bmiRecommendations.overweight;
  else rec = bmiRecommendations.obese;
const continent = document.getElementById("continent")?.value || "";
  const container = document.getElementById("bmiInfo");

  let html = `<div style="text-align:left; line-height:1.5;">`;
  html += `<h3 style="color:${rec.color}; margin-bottom:5px;">${rec.emoji} ${rec.category} Recommendations</h3>`;
  html += `<p style="margin:5px 0;">${rec.info}</p>`;
	
  // Diet (continent-specific if available)
html += `<h4 style="margin:10px 0 5px;">🍽 Diet</h4>`;

const key =
  category === "Underweight" ? "underweight" :
  category === "Normal Weight" ? "normal" :
  category === "Overweight" ? "overweight" : "obese";

const continentPlan = continentDiet[continent]?.[key];

if (continentPlan) {
  html += `<strong>Foods common in your region:</strong>
           <ul style="margin:3px 0 8px 20px; padding-left:20px; list-style-position: outside;">`;
  continentPlan.forEach(item => html += `<li style="margin:2px 0;">${item}</li>`);
  html += `</ul>`;
} else {
  // fallback to your existing generic diet
  for (const [section, items] of Object.entries(rec.diet)) {
    html += `<strong>${section}:</strong><ul style="margin:3px 0 8px 20px; padding-left:20px; list-style-position: outside;">`;
    items.forEach(item => html += `<li style="margin:2px 0;">${item}</li>`);
    html += `</ul>`;
  }
}


  html += `<h4 style="margin:10px 0 5px;">🏋️ Exercises</h4><ul style="margin:3px 0 8px 20px; padding-left:20px; list-style-position: outside;">`;
  rec.exercises.forEach((ex) => {
    html += `<li style="margin:2px 0;"><a href="${ex.url}" target="_blank">${ex.title}</a> (${ex.duration}) - ${ex.description}</li>`;
  });
  html += `</ul>`;

  html += `<h4 style="margin:10px 0 5px;">💡 Tips</h4><ul style="margin:3px 0 8px 20px; padding-left:20px; list-style-position: outside;">`;
  rec.tips.forEach((tip) => (html += `<li style="margin:2px 0;">${tip}</li>`));
  html += `</ul>`;

  html += `</div>`;
  container.innerHTML = html;
}
