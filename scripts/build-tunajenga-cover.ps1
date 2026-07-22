param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function New-RoundedPath {
  param([System.Drawing.RectangleF]$Rect, [float]$Radius)
  $diameter = $Radius * 2
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddArc($Rect.X, $Rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($Rect.X, $Rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRectangle {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Brush]$Brush,
    [System.Drawing.RectangleF]$Rect,
    [float]$Radius
  )
  $path = New-RoundedPath -Rect $Rect -Radius $Radius
  $Graphics.FillPath($Brush, $path)
  $path.Dispose()
}

function Draw-RoundedRectangle {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Pen]$Pen,
    [System.Drawing.RectangleF]$Rect,
    [float]$Radius
  )
  $path = New-RoundedPath -Rect $Rect -Radius $Radius
  $Graphics.DrawPath($Pen, $path)
  $path.Dispose()
}

function Draw-ContainedImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Image]$Image,
    [System.Drawing.RectangleF]$Bounds
  )
  $scale = [Math]::Min($Bounds.Width / $Image.Width, $Bounds.Height / $Image.Height)
  $width = [float]($Image.Width * $scale)
  $height = [float]($Image.Height * $scale)
  $x = [float]($Bounds.X + (($Bounds.Width - $width) / 2))
  $y = [float]($Bounds.Y + (($Bounds.Height - $height) / 2))
  $Graphics.DrawImage($Image, $x, $y, $width, $height)
}

function Draw-DeutschlandFlag {
  param([System.Drawing.Graphics]$Graphics, [System.Drawing.RectangleF]$Rect)
  $stripeHeight = $Rect.Height / 3
  $black = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 20, 24, 31))
  $red = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 221, 0, 0))
  $gold = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 206, 0))
  $Graphics.FillRectangle($black, $Rect.X, $Rect.Y, $Rect.Width, $stripeHeight)
  $Graphics.FillRectangle($red, $Rect.X, $Rect.Y + $stripeHeight, $Rect.Width, $stripeHeight)
  $Graphics.FillRectangle($gold, $Rect.X, $Rect.Y + ($stripeHeight * 2), $Rect.Width, $stripeHeight)
  $black.Dispose(); $red.Dispose(); $gold.Dispose()
}

function Draw-KenyaFlag {
  param([System.Drawing.Graphics]$Graphics, [System.Drawing.RectangleF]$Rect)
  $unit = $Rect.Height / 11
  $black = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::Black)
  $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $red = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 187, 0, 0))
  $green = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 0, 102, 51))
  $Graphics.FillRectangle($black, $Rect.X, $Rect.Y, $Rect.Width, $unit * 3)
  $Graphics.FillRectangle($white, $Rect.X, $Rect.Y + ($unit * 3), $Rect.Width, $unit)
  $Graphics.FillRectangle($red, $Rect.X, $Rect.Y + ($unit * 4), $Rect.Width, $unit * 3)
  $Graphics.FillRectangle($white, $Rect.X, $Rect.Y + ($unit * 7), $Rect.Width, $unit)
  $Graphics.FillRectangle($green, $Rect.X, $Rect.Y + ($unit * 8), $Rect.Width, $unit * 3)

  $centerX = $Rect.X + ($Rect.Width / 2)
  $centerY = $Rect.Y + ($Rect.Height / 2)
  $spearPen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, [float]($unit * .42))
  $Graphics.DrawLine($spearPen, $centerX - ($unit * 2.1), $Rect.Y + ($unit * 1.2), $centerX + ($unit * 2.1), $Rect.Bottom - ($unit * 1.2))
  $Graphics.DrawLine($spearPen, $centerX + ($unit * 2.1), $Rect.Y + ($unit * 1.2), $centerX - ($unit * 2.1), $Rect.Bottom - ($unit * 1.2))
  $shield = [System.Drawing.RectangleF]::new([float]($centerX - ($unit * 1.45)), [float]($centerY - ($unit * 3.2)), [float]($unit * 2.9), [float]($unit * 6.4))
  $Graphics.FillEllipse($red, $shield)
  $shieldPen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, [float]($unit * .38))
  $Graphics.DrawEllipse($shieldPen, $shield)
  $centerPen = [System.Drawing.Pen]::new([System.Drawing.Color]::Black, [float]($unit * .48))
  $Graphics.DrawLine($centerPen, $centerX, $shield.Y + ($unit * .55), $centerX, $shield.Bottom - ($unit * .55))
  $black.Dispose(); $white.Dispose(); $red.Dispose(); $green.Dispose(); $spearPen.Dispose(); $shieldPen.Dispose(); $centerPen.Dispose()
}

function Draw-SunglassesBadge {
  param([System.Drawing.Graphics]$Graphics, [System.Drawing.RectangleF]$Rect)
  $yellow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 202, 55))
  $ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 17, 25, 38))
  $outline = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 255, 232, 150), 5)
  $Graphics.FillEllipse($yellow, $Rect)
  $Graphics.DrawEllipse($outline, $Rect)
  $lensY = $Rect.Y + ($Rect.Height * .34)
  $lensW = $Rect.Width * .29
  $lensH = $Rect.Height * .19
  $Graphics.FillRectangle($ink, $Rect.X + ($Rect.Width * .17), $lensY, $lensW, $lensH)
  $Graphics.FillRectangle($ink, $Rect.X + ($Rect.Width * .54), $lensY, $lensW, $lensH)
  $Graphics.FillRectangle($ink, $Rect.X + ($Rect.Width * .45), $lensY + ($lensH * .38), $Rect.Width * .1, $lensH * .22)
  $smilePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 81, 47, 18), 6)
  $Graphics.DrawArc($smilePen, $Rect.X + ($Rect.Width * .28), $Rect.Y + ($Rect.Height * .5), $Rect.Width * .44, $Rect.Height * .28, 15, 150)
  $yellow.Dispose(); $ink.Dispose(); $outline.Dispose(); $smilePen.Dispose()
}

$backgroundPath = Join-Path $ProjectRoot 'assets\stories\audio\artwork\tunajenga-cover-background.png'
$stFirmLogoPath = Join-Path $ProjectRoot 'assets\ST-Firm Logo Transparent.png'
$ssosLogoPath = Join-Path $ProjectRoot 'assets\SSOS-Logo-Transparent.png'
$akademieLogoPath = Join-Path $ProjectRoot 'assets\stories\akademie-shield.png'
$outputDirectory = Join-Path $ProjectRoot 'assets\stories\audio\artwork'
$masterPath = Join-Path $outputDirectory 'tunajenga-cover-master.png'
$embeddedPath = Join-Path $outputDirectory 'tunajenga-cover-embedded.jpg'
$webPath = Join-Path $outputDirectory 'tunajenga-cover-web.jpg'

foreach ($requiredPath in @($backgroundPath, $stFirmLogoPath, $ssosLogoPath, $akademieLogoPath)) {
  if (-not (Test-Path -LiteralPath $requiredPath)) { throw "Missing artwork input: $requiredPath" }
}

$background = [System.Drawing.Image]::FromFile($backgroundPath)
$stFirmLogo = [System.Drawing.Image]::FromFile($stFirmLogoPath)
$ssosLogo = [System.Drawing.Image]::FromFile($ssosLogoPath)
$akademieLogo = [System.Drawing.Image]::FromFile($akademieLogoPath)
$canvas = [System.Drawing.Bitmap]::new(3000, 3000, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.DrawImage($background, 0, 0, 3000, 3000)

$glassBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(205, 255, 255, 255))
$softGlassBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(178, 255, 255, 255))
$navyBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 12, 31, 52))
$purpleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 108, 70, 194))
$goldBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 197, 137, 31))
$whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$goldPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(210, 220, 162, 51), 8)
$purplePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(180, 120, 77, 208), 6)

$titlePlate = [System.Drawing.RectangleF]::new(470, 135, 2060, 625)
Fill-RoundedRectangle -Graphics $graphics -Brush $glassBrush -Rect $titlePlate -Radius 86
Draw-RoundedRectangle -Graphics $graphics -Pen $goldPen -Rect $titlePlate -Radius 86

$logoPlate = [System.Drawing.RectangleF]::new(95, 90, 330, 355)
Fill-RoundedRectangle -Graphics $graphics -Brush $glassBrush -Rect $logoPlate -Radius 65
Draw-RoundedRectangle -Graphics $graphics -Pen $purplePen -Rect $logoPlate -Radius 65
Draw-ContainedImage -Graphics $graphics -Image $stFirmLogo -Bounds ([System.Drawing.RectangleF]::new(125, 108, 270, 320))

$flagPlate = [System.Drawing.RectangleF]::new(2575, 98, 330, 335)
Fill-RoundedRectangle -Graphics $graphics -Brush $glassBrush -Rect $flagPlate -Radius 60
Draw-RoundedRectangle -Graphics $graphics -Pen $goldPen -Rect $flagPlate -Radius 60
Draw-DeutschlandFlag -Graphics $graphics -Rect ([System.Drawing.RectangleF]::new(2630, 145, 220, 132))

$smallFont = [System.Drawing.Font]::new('Segoe UI Semibold', 38, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$countryFont = [System.Drawing.Font]::new('Segoe UI Semibold', 33, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$titleFont = [System.Drawing.Font]::new('Arial', 270, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subtitleFont = [System.Drawing.Font]::new('Segoe UI Semibold', 85, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$artistFont = [System.Drawing.Font]::new('Segoe UI', 118, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$formatCenter = [System.Drawing.StringFormat]::new()
$formatCenter.Alignment = [System.Drawing.StringAlignment]::Center
$formatCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

$graphics.DrawString('DEUTSCHLAND', $countryFont, $navyBrush, [System.Drawing.RectangleF]::new(2605, 295, 270, 72), $formatCenter)
$graphics.DrawString('ST-FIRM ORIGINAL', $smallFont, $purpleBrush, [System.Drawing.RectangleF]::new(615, 180, 1770, 70), $formatCenter)
$graphics.DrawString('TUNAJENGA', $titleFont, $navyBrush, [System.Drawing.RectangleF]::new(520, 225, 1960, 330), $formatCenter)
$graphics.DrawString('RAVINE TO THE WORLD', $subtitleFont, $goldBrush, [System.Drawing.RectangleF]::new(590, 520, 1820, 120), $formatCenter)

$kenyaPlate = [System.Drawing.RectangleF]::new(110, 2450, 395, 355)
Fill-RoundedRectangle -Graphics $graphics -Brush $glassBrush -Rect $kenyaPlate -Radius 58
Draw-RoundedRectangle -Graphics $graphics -Pen $purplePen -Rect $kenyaPlate -Radius 58
Draw-KenyaFlag -Graphics $graphics -Rect ([System.Drawing.RectangleF]::new(170, 2500, 275, 183))
$graphics.DrawString('KENYA', $countryFont, $navyBrush, [System.Drawing.RectangleF]::new(145, 2700, 325, 68), $formatCenter)

$artistPlate = [System.Drawing.RectangleF]::new(530, 2530, 1940, 310)
Fill-RoundedRectangle -Graphics $graphics -Brush $softGlassBrush -Rect $artistPlate -Radius 92
Draw-RoundedRectangle -Graphics $graphics -Pen $goldPen -Rect $artistPlate -Radius 92

$ssosPlate = [System.Drawing.RectangleF]::new(575, 2580, 210, 210)
$akademiePlate = [System.Drawing.RectangleF]::new(2215, 2580, 210, 210)
Fill-RoundedRectangle -Graphics $graphics -Brush $whiteBrush -Rect $ssosPlate -Radius 105
Fill-RoundedRectangle -Graphics $graphics -Brush $whiteBrush -Rect $akademiePlate -Radius 105
Draw-ContainedImage -Graphics $graphics -Image $ssosLogo -Bounds ([System.Drawing.RectangleF]::new(600, 2605, 160, 160))
Draw-ContainedImage -Graphics $graphics -Image $akademieLogo -Bounds ([System.Drawing.RectangleF]::new(2240, 2605, 160, 160))

$graphics.DrawString('#KingKunta', $artistFont, $navyBrush, [System.Drawing.RectangleF]::new(800, 2580, 1080, 200), $formatCenter)
Draw-SunglassesBadge -Graphics $graphics -Rect ([System.Drawing.RectangleF]::new(1825, 2620, 130, 130))
Draw-DeutschlandFlag -Graphics $graphics -Rect ([System.Drawing.RectangleF]::new(1985, 2635, 185, 111))

$canvas.Save($masterPath, [System.Drawing.Imaging.ImageFormat]::Png)

$embedded = [System.Drawing.Bitmap]::new(1400, 1400, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$embeddedGraphics = [System.Drawing.Graphics]::FromImage($embedded)
$embeddedGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$embeddedGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$embeddedGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$embeddedGraphics.DrawImage($canvas, 0, 0, 1400, 1400)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$encoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$encoderParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]91)
$embedded.Save($embeddedPath, $jpegCodec, $encoderParameters)

$web = [System.Drawing.Bitmap]::new(640, 640, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$webGraphics = [System.Drawing.Graphics]::FromImage($web)
$webGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$webGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$webGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$webGraphics.DrawImage($canvas, 0, 0, 640, 640)
$webEncoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$webEncoderParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]84)
$web.Save($webPath, $jpegCodec, $webEncoderParameters)

$webEncoderParameters.Dispose(); $webGraphics.Dispose(); $web.Dispose()
$encoderParameters.Dispose(); $embeddedGraphics.Dispose(); $embedded.Dispose()
$formatCenter.Dispose(); $smallFont.Dispose(); $countryFont.Dispose(); $titleFont.Dispose(); $subtitleFont.Dispose(); $artistFont.Dispose()
$glassBrush.Dispose(); $softGlassBrush.Dispose(); $navyBrush.Dispose(); $purpleBrush.Dispose(); $goldBrush.Dispose(); $whiteBrush.Dispose(); $goldPen.Dispose(); $purplePen.Dispose()
$graphics.Dispose(); $canvas.Dispose(); $background.Dispose(); $stFirmLogo.Dispose(); $ssosLogo.Dispose(); $akademieLogo.Dispose()

Get-Item -LiteralPath $masterPath, $embeddedPath, $webPath | Select-Object FullName, Length
