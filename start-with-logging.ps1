# Start Metro server and pipe output to metro-log.txt while displaying it live
Write-Host "--------------------------------------------------" -ForegroundColor Green
Write-Host "Starting Prerana Mobile App with logging..." -ForegroundColor Green
Write-Host "Full logs will be captured live in: metro-log.txt" -ForegroundColor Green
Write-Host "--------------------------------------------------" -ForegroundColor Green

npm start | Tee-Object -FilePath metro-log.txt
