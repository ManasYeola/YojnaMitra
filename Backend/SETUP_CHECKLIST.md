# ✅ TWILIO WHATSAPP SETUP CHECKLIST
## Follow this step-by-step checklist

---

## 📋 PART 1: Get Webhook URL

### ☐ Step 1.1: Find ngrok Window
- Look for a window titled "ngrok" or terminal with ngrok output
- If you don't see it, run: `.\ngrok.exe http 5000`

### ☐ Step 1.2: Copy the HTTPS URL
Look for this in the ngrok window:
```
Forwarding    https://1234-56-78-910-11.ngrok-free.app -> http://localhost:5000
```
Copy the **https** URL (not the http one)

### ☐ Step 1.3: Create Your Webhook URL
Add `/api/whatsapp/webhook` to the end of the ngrok URL

**Example:**
- ngrok URL: `https://1234-56-78-910-11.ngrok-free.app`
- Webhook URL: `https://1234-56-78-910-11.ngrok-free.app/api/whatsapp/webhook`

**✍️ Write your webhook URL here:**
```
https://______________________________.ngrok-free.app/api/whatsapp/webhook
```

---

## 📋 PART 2: Twilio Setup

### ☐ Step 2.1: Open Twilio Console
- Go to: https://console.twilio.com/
- Log in (or sign up if you don't have an account)

### ☐ Step 2.2: Navigate to WhatsApp Sandbox
1. Click **"Messaging"** in the left sidebar
2. Click **"Try it out"**
3. Click **"Send a WhatsApp message"**

### ☐ Step 2.3: Configure Webhook
On the WhatsApp Sandbox page:
1. Scroll to **"Sandbox Configuration"** section
2. Find field: **"WHEN A MESSAGE COMES IN"**
3. Paste your webhook URL (from Part 1, Step 1.3)
4. Set Method dropdown to: **POST**
5. Click **SAVE** button at the bottom

**Screenshot locations to look for:**
- Section title: "Sandbox Configuration"
- Text field labeled: "WHEN A MESSAGE COMES IN"
- Dropdown next to it should say: "HTTP POST"

---

## 📋 PART 3: Join WhatsApp Sandbox

### ☐ Step 3.1: Get Your Join Code
At the TOP of the WhatsApp Sandbox page, you'll see:
- **Twilio Sandbox Phone Number**: (e.g., +1 415 523 8886)
- **Your Join Code**: (e.g., "join happy-sheep-42")

**✍️ Write your details here:**
```
Twilio Number: +________________
Join Code: join ________________
```

### ☐ Step 3.2: Join from Your Phone
1. Open **WhatsApp** on your phone
2. Start a **new chat** with the Twilio number
3. Send this exact message: `join happy-sheep-42` (use YOUR join code)
4. Wait for confirmation message from Twilio

**Expected reply:**
```
You are all set! The sandbox is ready...
```

---

## 📋 PART 4: Test Your Chatbot

### ☐ Step 4.1: Start Conversation
In the **same WhatsApp chat**, send:
```
Hi
```

### ☐ Step 4.2: Expected Response
Bot should reply with:
```
🙏 Namaste! Welcome to YojnaMitra

Let's find the best government schemes for you!

1️⃣ Which state do you live in?

1. Maharashtra
2. Gujarat
...

Reply with the number (e.g., 1)
```

### ☐ Step 4.3: Complete the Questions
Answer all 8 questions:
1. State (reply with number 1-8)
2. Occupation Type (reply with number 1-6)
3. Land Ownership (reply with number 1-3)
4. Age Range (reply with number 1-4)
5. Caste Category (reply with number 1-5)
6. Annual Income (reply with number 1-4)
7. BPL Card Holder (reply with number 1-2)
8. Special Category (reply with number 1-4)

### ☐ Step 4.4: Get Results
After answering all questions, you should receive:
```
🎯 5 Best Schemes For You

💵 1. PM-KISAN Direct Benefit Scheme
📊 Match: 100%
...
```

---

## ❌ TROUBLESHOOTING

### Problem: Bot doesn't reply

**Check 1: Backend Running?**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/whatsapp/health" -UseBasicParsing
```
Should say: "WhatsApp webhook is active"

**Check 2: ngrok Still Running?**
- Is the ngrok window still open?
- If closed, restart: `.\ngrok.exe http 5000`
- Get NEW URL and update Twilio webhook again

**Check 3: Webhook Correct?**
- Go to Twilio WhatsApp Sandbox
- Check "WHEN A MESSAGE COMES IN" field
- Should end with `/api/whatsapp/webhook`
- Should match your current ngrok URL

**Check 4: Joined Sandbox?**
- Send join code again: `join your-code-here`
- Wait for confirmation before testing

### Problem: Wrong schemes appearing

- Send `restart` to reset the conversation
- Start again with `Hi`

### Problem: ngrok URL changed

**This happens every time ngrok restarts!**
1. Get new URL from ngrok window
2. Go to Twilio webhook settings
3. Update with NEW URL
4. Save
5. Test again

---

## ✅ SUCCESS CHECKLIST

After setup, you should have:
- ☐ Backend running on port 5000
- ☐ ngrok window open with public URL
- ☐ Twilio webhook configured with ngrok URL
- ☐ Joined WhatsApp sandbox
- ☐ Bot responding to "Hi" message
- ☐ Able to answer questions and get scheme recommendations

---

## 🎯 QUICK COMMANDS

**Check Backend:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/whatsapp/health" -UseBasicParsing
```

**Start ngrok:**
```powershell
.\ngrok.exe http 5000
```

**Run Local Test:**
```powershell
.\test-enhanced-whatsapp.ps1
```

**Restart Everything:**
```powershell
# Stop processes
taskkill /F /IM node.exe
Get-Process | Where-Object { $_.ProcessName -like "*ngrok*" } | Stop-Process -Force

# Start backend
npm run dev

# Start ngrok (in new terminal)
.\ngrok.exe http 5000

# Get new webhook URL and update Twilio
```

---

## 📞 NEED HELP?

1. Read `TWILIO_SETUP_STEPS.ps1` for detailed comments
2. Check `ENHANCED_CHATBOT_DOCUMENTATION.md` for technical details
3. Review `TWILIO_SETUP_COMPLETE.md` for comprehensive troubleshooting

---

**Last Updated:** February 21, 2026
**Your Setup:** Enhanced 8-Question Flow with MongoDB Filtering
