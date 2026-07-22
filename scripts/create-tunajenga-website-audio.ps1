param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$FfmpegPath = ''
)

$ErrorActionPreference = 'Stop'

if (-not $FfmpegPath) {
  $FfmpegPath = Join-Path $ProjectRoot '.codex-tools\ffmpeg\node_modules\ffmpeg-static\ffmpeg.exe'
}

$sourcePath = Join-Path $ProjectRoot 'assets\stories\audio\st-firm-tunajenga-release.mp3'
$coverPath = Join-Path $ProjectRoot 'assets\stories\audio\artwork\tunajenga-cover-web.jpg'
$outputPath = Join-Path $ProjectRoot 'assets\stories\audio\st-firm-tunajenga-website.mp3'
$workingDirectory = Join-Path $ProjectRoot '.codex-tools\audio-work'
$rawPath = Join-Path $workingDirectory 'st-firm-tunajenga-website-untagged.mp3'

foreach ($requiredPath in @($FfmpegPath, $sourcePath, $coverPath)) {
  if (-not (Test-Path -LiteralPath $requiredPath)) { throw "Missing website-audio input: $requiredPath" }
}
if (-not (Test-Path -LiteralPath $workingDirectory)) { New-Item -ItemType Directory -Path $workingDirectory | Out-Null }

& $FfmpegPath -hide_banner -loglevel error -y `
  -ss '00:00:42.000' `
  -i $sourcePath `
  -t '00:01:10.000' `
  -map '0:a:0' `
  -map_metadata -1 `
  -vn `
  -af 'afade=t=out:st=69.0:d=1.0' `
  -c:a libmp3lame `
  -b:a 192k `
  -ar 44100 `
  -ac 2 `
  $rawPath
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed while cutting the website edit (exit $LASTEXITCODE)" }

# Guard against timestamp/export regressions that can leave a correctly sized MP3
# containing silence after the opening section. Both checkpoints must contain
# meaningful signal before the public website file is replaced.
foreach ($checkpoint in @('00:00:28.000', '00:01:00.000')) {
  $previousErrorPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $volumeReport = & $FfmpegPath -hide_banner `
    -ss $checkpoint `
    -t '00:00:03.000' `
    -i $rawPath `
    -map '0:a:0' `
    -af 'volumedetect' `
    -f null NUL 2>&1 | Out-String
  $volumeExitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorPreference
  if ($volumeExitCode -ne 0) { throw "FFmpeg failed while validating audio at $checkpoint (exit $volumeExitCode)" }

  $maximumVolumeMatch = [regex]::Match($volumeReport, 'max_volume:\s*(-?[0-9]+(?:\.[0-9]+)?)\s*dB')
  if (-not $maximumVolumeMatch.Success) { throw "Could not read the audio level at $checkpoint" }
  $maximumVolume = [double]::Parse($maximumVolumeMatch.Groups[1].Value, [Globalization.CultureInfo]::InvariantCulture)
  if ($maximumVolume -le -45) { throw "Audio checkpoint failed at $checkpoint ($maximumVolume dB): the website edit contains silence" }
}

& $FfmpegPath -hide_banner -loglevel error -y `
  -i $rawPath `
  -i $coverPath `
  -map '0:a:0' `
  -map '1:v:0' `
  -c:a copy `
  -c:v mjpeg `
  -id3v2_version 3 `
  -metadata 'title=Tunajenga — Ravine to the World (Website Film Edit)' `
  -metadata 'artist=#KingKunta😎🇩🇪' `
  -metadata 'album_artist=#KingKunta😎🇩🇪' `
  -metadata 'album=Knowledge Without Borders' `
  -metadata 'genre=Kenyan Amapiano / Gengetone / Afro-Fusion' `
  -metadata 'date=2026' `
  -metadata 'publisher=ST-Firm — Berlin, Deutschland' `
  -metadata 'comment=Website film edit sourced from 00:42–01:52 of the original ST-Firm anthem.' `
  -metadata:s:v 'title=Album cover' `
  -metadata:s:v 'comment=Cover (front)' `
  -disposition:v attached_pic `
  $outputPath
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed while tagging the website edit (exit $LASTEXITCODE)" }

Get-Item -LiteralPath $outputPath | Select-Object FullName, Length, LastWriteTime
