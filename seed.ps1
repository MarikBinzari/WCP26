$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcWhyY29oemR3bXJyb2xnbmx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkyNjI5NywiZXhwIjoyMDkzNTAyMjk3fQ.-gZ3P9xnbzqIVu0Eoou0Y04E0XiH9NwS-4-e5_5KmmI"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}
Invoke-RestMethod -Uri "https://xpqhrcohzdwmrrolgnlw.supabase.co/functions/v1/seed-players-apifootball" -Method POST -Headers $headers -Body "{}"
