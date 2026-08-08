const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Twilio credentials (replace with yours)
const accountSid = 'ACxxxxxxxxxxxxxxxxxxx';
const authToken  = 'your_auth_token';
const twilioNumber = '+1XXXXXXXXXX'; // your Twilio number
const client = twilio(accountSid, authToken);

// In-memory OTP store
const otpStore = {};

// Send OTP
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP
  otpStore[phone] = otp;

  try {
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: twilioNumber,
      to: phone
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (otpStore[phone] && otpStore[phone] == otp) {
    delete otpStore[phone];
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
5..
app.listen(3000, () => console.log('Server running on port 3000'));
