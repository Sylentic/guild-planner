@echo off
REM Script to download Star Citizen manufacturer logos locally
REM Run with: scripts/download-logos.bat

setlocal enabledelayedexpansion

set "LOGOS_DIR=public\images\manufacturers"
if not exist "%LOGOS_DIR%" mkdir "%LOGOS_DIR%"
echo Created directory: %LOGOS_DIR%

REM Download each logo
set "logos[0]=https://robertsspaceindustries.com/media/z4ioxeze11o3hr/logo/Aegis_Logo.png|Aegis_Logo.png"
set "logos[1]=https://robertsspaceindustries.com/media/txhzevx6s17m4r/logo/Anvil_Logo.png|Anvil_Logo.png"
set "logos[2]=https://robertsspaceindustries.com/media/m7xgd8eghus4ar/logo/Aopoa_Logo.png|Aopoa_Logo.png"
set "logos[3]=https://robertsspaceindustries.com/media/mfvgeneqcc7khr/logo/ARGO_Logo.png|ARGO_Logo.png"
set "logos[4]=https://robertsspaceindustries.com/media/oqf2g7g7t3ttar/logo/Banu_Logo.png|Banu_Logo.png"
set "logos[5]=https://robertsspaceindustries.com/media/5ubymzqrfp20gr/logo/CO_Logo.png|CO_Logo.png"
set "logos[6]=https://robertsspaceindustries.com/media/qcdj1phfyctc6r/logo/Crusader_Logo.png|Crusader_Logo.png"
set "logos[7]=https://robertsspaceindustries.com/media/2g62ywllvk2f1r/logo/Drake_logo.png|Drake_logo.png"
set "logos[8]=https://robertsspaceindustries.com/media/kkad2w34u0ejir/logo/Esperia_Logo.png|Esperia_Logo.png"
set "logos[9]=https://robertsspaceindustries.com/media/2wifj4j8q1mdpr/logo/Gatac_Logo.png|Gatac_Logo.png"
set "logos[10]=https://robertsspaceindustries.com/media/k8vsj8oo0e6iir/logo/Greycat_Logo.png|Greycat_Logo.png"
set "logos[11]=https://cdn.robertsspaceindustries.com/orion-v3/logoratios/greysmarket_monochrome_completed_2_1-43d53201.svg|greysmarket_monochrome_completed_2_1-43d53201.svg"
set "logos[12]=https://robertsspaceindustries.com/media/7duwvqqr0s5p3r/logo/Kruger_logo.png|Kruger_logo.png"
set "logos[13]=https://robertsspaceindustries.com/media/0bfruuxq5n1mor/logo/MISC_Logo.png|MISC_Logo.png"
set "logos[14]=https://robertsspaceindustries.com/media/epkp1tquy1xrir/logo/Mirai_logo.png|Mirai_logo.png"
set "logos[15]=https://robertsspaceindustries.com/media/h0pqev5c00j70r/logo/ORIG_Logo.png|ORIG_Logo.png"
set "logos[16]=https://robertsspaceindustries.com/media/c5v6y3t8e5yphr/logo/RSI_Logo.png|RSI_Logo.png"
set "logos[17]=https://robertsspaceindustries.com/media/g49sf4h2yvdrer/logo/Tumbril_Logo.png|Tumbril_Logo.png"
set "logos[18]=https://robertsspaceindustries.com/media/s6a5p3z7ek5lar/logo/Vanduul_Logo.png|Vanduul_Logo.png"

for /l %%i in (0,1,18) do (
  for /f "tokens=1,2 delims=|" %%a in ("!logos[%%i]!") do (
    if not "%%a"=="" (
      echo Downloading %%b...
      powershell -Command "Invoke-WebRequest -Uri '%%a' -OutFile '%LOGOS_DIR%\%%b'" 2>nul
      if exist "%LOGOS_DIR%\%%b" (
        echo ✓ Downloaded %%b
      ) else (
        echo ✗ Failed to download %%b
      )
    )
  )
)

echo.
echo Downloads complete!
pause
