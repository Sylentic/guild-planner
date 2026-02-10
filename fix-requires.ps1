$file = 'src/hooks/__tests__/usePermissions.test.ts'
$content = [System.IO.File]::ReadAllText($file)

# Replace all occurrences of const supabaseMock = require(...); supabaseMock with jest.mocked(supabase)
# This pattern handles the multi-line case
$content = $content -replace "const supabaseMock = require\(`@'/lib/supabase`'\);\r?\n\s+supabaseMock", "jest.mocked(supabase)"

[System.IO.File]::WriteAllText($file, $content)
Write-Host "Done"
