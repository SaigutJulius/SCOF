<#
  build-brand-icons.ps1

  Generates the SCOF + ST-Firm browser/app icon set and social-share cards from
  the master logos, with zero external dependencies (Windows System.Drawing).

  Why plates: the ST-Firm mark has dark-navy text on transparency, so on a dark
  browser tab it would vanish. Every favicon is composed on a rounded-square
  brand plate so the mark is ALWAYS visible, in light and dark themes alike.

  Run:  powershell -ExecutionPolicy Bypass -File scripts/build-brand-icons.ps1
  Output: assets/brand/*.png
#>
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$root   = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'assets'
$outDir = Join-Path $assets 'brand'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$scofSrcPath = Join-Path $assets 'SCOF MAIN LOGO.png'
$stSrcPath   = Join-Path $assets 'ST-Firm Logo Transparent.png'

# Brand palette
$scofPlate = [System.Drawing.Color]::FromArgb(255, 0x15, 0x3d, 0x2d)   # forest green
$stPlate   = [System.Drawing.Color]::FromArgb(255, 0xf6, 0xf9, 0xfc)   # ivory white
$iconSizes = 32, 48, 180, 192, 512

function Get-ContentBounds([System.Drawing.Bitmap]$bmp, [bool]$hasAlpha) {
  # Detect the mark's bounding box on a downscaled copy (fast), then scale back.
  $dw = 256
  $dh = [int][math]::Round($bmp.Height * 256.0 / $bmp.Width)
  $small = New-Object System.Drawing.Bitmap $dw, $dh
  $g = [System.Drawing.Graphics]::FromImage($small)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($bmp, 0, 0, $dw, $dh)
  $g.Dispose()

  $bg = $small.GetPixel(0, 0)
  $minX = $dw; $minY = $dh; $maxX = 0; $maxY = 0
  for ($y = 0; $y -lt $dh; $y++) {
    for ($x = 0; $x -lt $dw; $x++) {
      $p = $small.GetPixel($x, $y)
      $content = $false
      if ($hasAlpha) {
        if ($p.A -gt 24) { $content = $true }
      } else {
        $delta = [math]::Abs($p.R - $bg.R) + [math]::Abs($p.G - $bg.G) + [math]::Abs($p.B - $bg.B)
        if ($delta -gt 42) { $content = $true }
      }
      if ($content) {
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  $small.Dispose()
  if ($maxX -le $minX -or $maxY -le $minY) {
    return New-Object System.Drawing.RectangleF 0, 0, $bmp.Width, $bmp.Height
  }
  $sx = $bmp.Width / [double]$dw
  $sy = $bmp.Height / [double]$dh
  return New-Object System.Drawing.RectangleF `
    ([single]($minX * $sx)), ([single]($minY * $sy)), `
    ([single](($maxX - $minX + 1) * $sx)), ([single](($maxY - $minY + 1) * $sy))
}

function New-RoundedPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Save-Icon([System.Drawing.Bitmap]$src, $bounds, [int]$size, [System.Drawing.Color]$plate, [double]$padFrac, [string]$outPath) {
  $canvas = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.SmoothingMode = 'AntiAlias'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)

  $radius = [single]($size * 0.22)
  $path = New-RoundedPath 0 0 $size $size $radius
  $brush = New-Object System.Drawing.SolidBrush $plate
  $g.FillPath($brush, $path)
  $g.SetClip($path)

  $pad = $size * $padFrac
  $avail = $size - 2 * $pad
  $scale = [math]::Min($avail / $bounds.Width, $avail / $bounds.Height)
  $dw = $bounds.Width * $scale
  $dh = $bounds.Height * $scale
  $dx = ($size - $dw) / 2
  $dy = ($size - $dh) / 2
  $dest = New-Object System.Drawing.RectangleF ([single]$dx), ([single]$dy), ([single]$dw), ([single]$dh)
  $g.DrawImage($src, $dest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)

  $g.ResetClip()
  $brush.Dispose(); $path.Dispose(); $g.Dispose()
  $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
}

function Get-FittingFont([System.Drawing.Graphics]$g, [string]$text, [string]$family, [single]$startSize, [System.Drawing.FontStyle]$style, [single]$maxWidth) {
  for ($size = $startSize; $size -ge 8; $size -= 1) {
    $f = New-Object System.Drawing.Font $family, $size, $style
    if ($g.MeasureString($text, $f).Width -le $maxWidth) { return $f }
    $f.Dispose()
  }
  return New-Object System.Drawing.Font $family, 8, $style
}

function Save-OgCard([System.Drawing.Bitmap]$src, $bounds, [System.Drawing.Color]$c1, [System.Drawing.Color]$c2, [System.Drawing.Color]$titleColor, [System.Drawing.Color]$subColor, [string]$title, [string]$subtitle, [string]$kicker, [string]$outPath) {
  $w = 1200; $h = 630
  $canvas = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.SmoothingMode = 'AntiAlias'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.TextRenderingHint = 'ClearTypeGridFit'

  $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
  $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 25.0
  $g.FillRectangle($grad, $rect)
  $grad.Dispose()

  # Logo on the left third.
  $logoBox = 400.0
  $scale = [math]::Min($logoBox / $bounds.Width, $logoBox / $bounds.Height)
  $dw = $bounds.Width * $scale
  $dh = $bounds.Height * $scale
  $dx = 110 + ($logoBox - $dw) / 2
  $dy = ($h - $dh) / 2
  $dest = New-Object System.Drawing.RectangleF ([single]$dx), ([single]$dy), ([single]$dw), ([single]$dh)
  $g.DrawImage($src, $dest, $bounds, [System.Drawing.GraphicsUnit]::Pixel)

  # Text block on the right. Fonts auto-fit the available width so nothing clips.
  $tx = 580.0
  $tw = [single]($w - $tx - 60)
  $noWrap = New-Object System.Drawing.StringFormat
  $noWrap.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
  $noWrap.Trimming = [System.Drawing.StringTrimming]::None

  $kickerText = $kicker.ToUpper()
  $kickerFont = Get-FittingFont $g $kickerText 'Segoe UI' 21 ([System.Drawing.FontStyle]::Bold) $tw
  $titleFont  = Get-FittingFont $g $title 'Segoe UI' 80 ([System.Drawing.FontStyle]::Bold) $tw
  $subFont    = New-Object System.Drawing.Font 'Segoe UI', 27, ([System.Drawing.FontStyle]::Regular)
  $kickerBrush = New-Object System.Drawing.SolidBrush $subColor
  $titleBrush  = New-Object System.Drawing.SolidBrush $titleColor
  $subBrush    = New-Object System.Drawing.SolidBrush $subColor

  $g.DrawString($kickerText, $kickerFont, $kickerBrush, [single]$tx, [single]210, $noWrap)
  $g.DrawString($title, $titleFont, $titleBrush, [single]$tx, [single]244, $noWrap)
  $subRect = New-Object System.Drawing.RectangleF ([single]$tx), ([single]382), $tw, ([single]160)
  $g.DrawString($subtitle, $subFont, $subBrush, $subRect)

  $noWrap.Dispose()
  $kickerFont.Dispose(); $titleFont.Dispose(); $subFont.Dispose()
  $kickerBrush.Dispose(); $titleBrush.Dispose(); $subBrush.Dispose()
  $g.Dispose()
  $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
}

Write-Host 'Loading source logos...'
$scof = New-Object System.Drawing.Bitmap $scofSrcPath
$st   = New-Object System.Drawing.Bitmap $stSrcPath
$scofBounds = Get-ContentBounds $scof $false
$stBounds   = Get-ContentBounds $st   $true

Write-Host 'Generating favicons...'
foreach ($size in $iconSizes) {
  Save-Icon $scof $scofBounds $size $scofPlate 0.08 (Join-Path $outDir "scof-icon-$size.png")
  Save-Icon $st   $stBounds   $size $stPlate   0.10 (Join-Path $outDir "st-firm-icon-$size.png")
  Write-Host "  wrote scof-icon-$size.png + st-firm-icon-$size.png"
}

Write-Host 'Generating Open Graph share cards...'
Save-OgCard $scof $scofBounds `
  ([System.Drawing.Color]::FromArgb(255, 6, 26, 18)) ([System.Drawing.Color]::FromArgb(255, 22, 54, 37)) `
  ([System.Drawing.Color]::FromArgb(255, 232, 200, 120)) ([System.Drawing.Color]::FromArgb(255, 214, 232, 214)) `
  'SCOF' 'From Kenyan farms to a global digital ecosystem.' 'Rooted in Kenya - Engineered by ST-Firm' `
  (Join-Path $outDir 'scof-og.png')

Save-OgCard $st $stBounds `
  ([System.Drawing.Color]::FromArgb(255, 238, 242, 247)) ([System.Drawing.Color]::FromArgb(255, 210, 222, 238)) `
  ([System.Drawing.Color]::FromArgb(255, 15, 34, 66)) ([System.Drawing.Color]::FromArgb(255, 46, 74, 110)) `
  'ST-FIRM' 'We build sovereign systems. Architecture, software and AI.' 'Idee meets Tech - Kenya x Deutschland' `
  (Join-Path $outDir 'st-firm-og.png')

$scof.Dispose(); $st.Dispose()
Write-Host "Done. Assets written to $outDir"
