# COMPLETE TWILIO WHATSAPP SETUP GUIDE
# Follow these steps EXACTLY to get your chatbot working

## ============================================
##  STEP 1: GET YOUR WEBHOOK URL FROM NGROK
## ============================================

# An ngrok window should be open on your screen.
# Look for something like this in that window:

#   Session Status                online
#   Forwarding                    https://abcd-12-34-567-89.ngrok-free.app -> http://localhost:5000

# THE URL you need is the HTTPS one (https://abcd-12-34-567-89.ngrok-free.app)

# YOUR WEBHOOK URL = [ngrok URL] + /api/whatsapp/webhook

# EXAMPLE:
#   If ngrok shows: https://12ab-34-56-789-01.ngrok-free.app
#   Your webhook is: https://12ab-34-56-789-01.ngrok-free.app/api/whatsapp/webhook

## ============================================
##  STEP 2: SIGN UP FOR TWILIO (IF NOT DONE)
## ============================================

# 1. Open browser and go to: https://www.twilio.com/try-twilio
# 2. Fill in details:
#    - First Name & Last Name
#    - Email
#    - Password
# 3. Verify your email
# 4. Verify your phone number (they'll send you a code)
# 5. Answer questions: Select "WhatsApp" and "With code"

## ============================================
##  STEP 3: GO TO WHATSAPP SANDBOX
## ============================================

# After logging into Twilio:
# 1. On left sidebar, click: Messaging
# 2. Click: Try it out
# 3. Click: Send a WhatsApp message
# 4. You'll see the WhatsApp Sandbox page

## ============================================
##  STEP 4: CONFIGURE WEBHOOK (MOST IMPORTANT!)
## ============================================

# On the WhatsApp Sandbox page:
# 1. Scroll down to section called "Sandbox Configuration"
# 2. Find field: "WHEN A MESSAGE COMES IN"
# 3. PASTE your webhook URL (from Step 1)
#    Example: https://12ab-34-56-789-01.ngrok-free.app/api/whatsapp/webhook
# 4. Make sure Method is: POST
# 5. Click the SAVE button at the bottom

## ============================================
##  STEP 5: JOIN THE WHATSAPP SANDBOX
## ============================================

# On the same WhatsApp Sandbox page, at the top you'll see:
# - Twilio Sandbox Number (like: +1 415 523 8886)
# - Join code (like: "join happy-sheep-42")

# NOW ON YOUR PHONE:
# 1. Open WhatsApp
# 2. Start a new chat with the Twilio number
# 3. Send EXACTLY this message: join happy-sheep-42
#    (Replace with YOUR join code shown in Twilio)
# 4. Wait for reply: "You are all set! The sandbox is ready..."

## ============================================
##  STEP 6: TEST YOUR CHATBOT!
## ============================================

# In the SAME WhatsApp chat:
# 1. Send: Hi
# 2. Bot should reply with state selection
# 3. Reply: 1 (for Maharashtra)
# 4. Bot asks for occupation type
# 5. Reply: 1 (for Crop Farmer)
# 6. Continue answering all 8 questions
# 7. Get personalized scheme recommendations!

## ============================================
##  TROUBLESHOOTING
## ============================================

# Bot doesn't reply?
# - Check ngrok window is still open
# - Check this PowerShell window shows backend running
# - Go back to Twilio and verify webhook URL is correct
# - Try sending "restart" to reset the conversation

# Need to restart everything?
# 1. Close ngrok window
# 2. Run: .\start-ngrok.ps1
# 3. Get new webhook URL from ngrok window
# 4. Update Twilio webhook with NEW URL
# 5. Test again

## ============================================
##  QUICK REFERENCE
## ============================================

# Backend status: Invoke-WebRequest -Uri "http://localhost:5000/api/whatsapp/health" -UseBasicParsing
# Start ngrok: .\ngrok.exe http 5000
# Test locally: .\test-enhanced-whatsapp.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SETUP GUIDE DISPLAYED ABOVE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "CURRENT STATUS:" -ForegroundColor Yellow
Write-Host "- Backend: RUNNING on port 5000" -ForegroundColor Green
Write-Host "- ngrok: SHOULD BE OPEN in another window" -ForegroundColor Green
Write-Host "`nNEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Find the HTTPS URL in the ngrok window" -ForegroundColor White
Write-Host "2. Add '/api/whatsapp/webhook' to the end" -ForegroundColor White
Write-Host "3. Go to Twilio and paste in webhook field" -ForegroundColor White
Write-Host "4. Save, join sandbox, test!`n" -ForegroundColor White
