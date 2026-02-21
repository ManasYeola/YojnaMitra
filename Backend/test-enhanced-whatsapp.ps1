# Enhanced WhatsApp Chatbot Test Script
# Tests the new 8-question flow

Write-Host "`n=========================================================" -ForegroundColor Cyan
Write-Host "   Testing Enhanced WhatsApp Chatbot (8-Question Flow)" -ForegroundColor Cyan
Write-Host "=========================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api/whatsapp/webhook"
$phoneNumber = "whatsapp:+919876543210"

# Test 1: Initiate conversation
Write-Host "Step 1: Starting conversation..." -ForegroundColor Yellow
$body1 = @{ Body = "Hi"; From = $phoneNumber } | ConvertTo-Json
try {
    $response1 = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body1 -UseBasicParsing
    [xml]$xml1 = $response1.Content
    Write-Host $xml1.Response.Message -ForegroundColor Green
    Write-Host "`n-------------------------------------------------`n" -ForegroundColor DarkGray
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 2: Select state (1 = Maharashtra)
Write-Host "Step 2: Selecting State - Maharashtra (1)" -ForegroundColor Yellow
$body2 = @{ Body = "1"; From = $phoneNumber } | ConvertTo-Json
try {
    $response2 = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body2 -UseBasicParsing
    [xml]$xml2 = $response2.Content
    Write-Host $xml2.Response.Message -ForegroundColor Green
    Write-Host "`n-------------------------------------------------`n" -ForegroundColor DarkGray
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 3: Select occupation (1 = Farmer - Crop)
Write-Host "Step 3: Selecting Occupation - Crop Farmer (1)" -ForegroundColor Yellow
$body3 = @{ Body = "1"; From = $phoneNumber } | ConvertTo-Json
try {
    $response3 = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body3 -UseBasicParsing
    [xml]$xml3 = $response3.Content
    Write-Host $xml3.Response.Message -ForegroundColor Green
    Write-Host "`n-------------------------------------------------`n" -ForegroundColor DarkGray
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 4: Select land ownership (1 = Own Land)
Write-Host "Step 4: Selecting Land Ownership - Owned (1)" -ForegroundColor Yellow
$body4 = @{ Body = "1"; From = $phoneNumber } | ConvertTo-Json
try {
    $response4 = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body4 -UseBasicParsing
    [xml]$xml4 = $response4.Content
    Write-Host $xml4.Response.Message -ForegroundColor Green
    Write-Host "`n-------------------------------------------------`n" -ForegroundColor DarkGray
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 5: Select age (2 = 18-40)
Write-Host "Step 5: Selecting Age - 18-40 (2)" -ForegroundColor Yellow
$body5 = @{ Body = "2"; From = $phoneNumber } | ConvertTo-Json
try {
    $response5 = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body5 -UseBasicParsing
    [xml]$xml5 = $response5.Content
    Write-Host $xml5.Response.Message -ForegroundColor Green
    Write-Host "`n-------------------------------------------------`n" -ForegroundColor DarkGray
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 6: Select caste (1 = General)
Write-Host "Step 6: Selecting Caste - General (1)" -ForegroundColor Yellow
$body6 = @{ Body = "1"; From = $phoneNumber } | ConvertTo-Json
try {
    $response6 = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body6 -UseBasicParsing
    [xml]$xml6 = $response6.Content
    Write-Host $xml6.Response.Message -ForegroundColor Green
    Write-Host "`n-------------------------------------------------`n" -ForegroundColor DarkGray
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 7: Select income (2 = 1-3 Lakh)
Write-Host "Step 7: Selecting Income - 1-3 Lakh (2)" -ForegroundColor Yellow
$body7 = @{ Body = "2"; From = $phoneNumber } | ConvertTo-Json
try {
    $response7 = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body7 -UseBasicParsing
    [xml]$xml7 = $response7.Content
    Write-Host $xml7.Response.Message -ForegroundColor Green
    Write-Host "`n-------------------------------------------------`n" -ForegroundColor DarkGray
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 8: Select BPL (2 = No)
Write-Host "Step 8: Selecting BPL Status - No (2)" -ForegroundColor Yellow
$body8 = @{ Body = "2"; From = $phoneNumber } | ConvertTo-Json
try {
    $response8 = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body8 -UseBasicParsing
    [xml]$xml8 = $response8.Content
    Write-Host $xml8.Response.Message -ForegroundColor Green
    Write-Host "`n-------------------------------------------------`n" -ForegroundColor DarkGray
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 9: Select special category (3 = Youth)
Write-Host "Step 9: Selecting Special Category - Youth (3)" -ForegroundColor Yellow
$body9 = @{ Body = "3"; From = $phoneNumber } | ConvertTo-Json
try {
    $response9 = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body9 -UseBasicParsing
    [xml]$xml9 = $response9.Content
    Write-Host "`n=========================================================" -ForegroundColor Green
    Write-Host "                   MATCHED SCHEMES" -ForegroundColor Green
    Write-Host "=========================================================`n" -ForegroundColor Green
    Write-Host $xml9.Response.Message -ForegroundColor Cyan
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=========================================================" -ForegroundColor Green
Write-Host "             TEST COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "=========================================================`n" -ForegroundColor Green
