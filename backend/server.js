const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- MongoDB Atlas Connection ---
const uri =
  "mongodb+srv://prathamesh_user:prathamesh%402005@cluster0.p84k1m9.mongodb.net/mydb";

mongoose
  .connect(uri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- User Schema & Model ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// --- Appointment Schema & Model ---
const appointmentSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    doctor: { type: String, required: true },
    specialty: { type: String, required: true },
    experience: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    payment: { type: String, required: true },
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "appointments" }
);
const Appointment = mongoose.model("Appointment", appointmentSchema);

// --- Contact Schema & Model ---
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  purpose: String,
  subject: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model("Contact", contactSchema);


// --- ✅ NEW: Message Schema & Model ---
const messageSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", messageSchema);


// --- API ROUTES ---

// ✅ Register User
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    res.json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login User
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Save Appointment to DB
app.post("/api/appointments", async (req, res) => {
  try {
    const {
      patientName,
      address,
      phone,
      doctor,
      specialty,
      experience,
      date,
      time,
      reason,
      payment,
    } = req.body;

    if (
      !patientName ||
      !address ||
      !phone ||
      !doctor ||
      !specialty ||
      !experience ||
      !date ||
      !time ||
      !reason ||
      !payment
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const appointment = new Appointment({
      patientName,
      address,
      phone,
      doctor,
      specialty,
      experience,
      date,
      time,
      reason,
      payment,
    });

    await appointment.save();
    res.json({ message: "Appointment saved successfully", appointment });
  } catch (err) {
    console.error("Error saving appointment:", err);
    res.status(500).json({ message: "Server error saving appointment" });
  }
});

// ✅ Fetch All Appointments
app.get("/api/appointments", async (req, res) => {
  try {
    const all = await Appointment.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

// ✅ Contact form route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, purpose, subject, message } = req.body;

    if (!name || !email || !purpose || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new Contact({ name, email, purpose, subject, message });
    await newContact.save();

    res.json({ message: "Message received successfully", contact: newContact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error saving contact message" });
  }
});


// --- ✅ NEW: API Route to store messages ---
app.post("/api/messages", async (req, res) => {
  try {
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = new Message({ recipient, subject, message });
    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully!", data: newMessage });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ message: "Server error while saving the message" });
  }
});


// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));