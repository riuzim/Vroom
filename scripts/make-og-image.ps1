# make-og-image.ps1 — gera apps/web/public/og.png (1200x630), a imagem de
# preview do Open Graph/Twitter usada por WhatsApp, Telegram, Discord etc.
#
# Visual "Oficina Noturna": uma foto REAL do catálogo (apps/api/prisma/
# car-images) fortemente desfocada — o próprio visual do jogo —, overlay
# escuro, glow quente de lampião, grain 1-bit, faixa quadriculada de
# chegada e wordmark VROOM. Nenhuma API externa: só System.Drawing (.NET).
#
# Rodar de novo a qualquer momento (troque $carImage para outra foto):
#   pwsh scripts/make-og-image.ps1
# Comitar o resultado: apps/web/public/og.png (referenciada no index.html).

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$carImage = Join-Path $root 'apps/api/prisma/car-images/ferrari-f40.jpg'
$outFile = Join-Path $root 'apps/web/public/og.jpg'

# Lienzo OG padrão (og:image recomendado: 1200x630).
$W = 1200
$H = 630

# Paleta da marca (apps/web/src/styles.css): ink/bone/flame.
$ink = [System.Drawing.Color]::FromArgb(28, 25, 23)
$bone = [System.Drawing.Color]::FromArgb(234, 228, 213)
$flame = [System.Drawing.Color]::FromArgb(255, 109, 0)

function New-Canvas([int]$w, [int]$h) {
    New-Object System.Drawing.Bitmap($w, $h)
}

# --- 1) Foto de capa: cover-crop centralizado para 1200x630 ---------------
$src = [System.Drawing.Image]::FromFile($carImage)
try {
    $scale = [Math]::Max($W / $src.Width, $H / $src.Height)
    $dw = [int][Math]::Ceiling($src.Width * $scale)
    $dh = [int][Math]::Ceiling($src.Height * $scale)
    $dx = -[int](($dw - $W) / 2)
    $dy = -[int](($dh - $H) / 2)

    $canvas = New-Canvas $W $H
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($src, $dx, $dy, $dw, $dh)

    # --- 2) "Blur" bokeh: reduz a poucos pixels e volta bicubic (2 passes) -
    # O jogo começa com INITIAL_BLUR=15px; aqui o blur é maior de propósito:
    # o og:image é teaser, não spoiler. Importante: $g fica preso ao MESMO
    # $canvas — substituir o Bitmap por baixo do Graphics descartaria tudo o
    # que for desenhado depois (glow, texto...). Então o blur é pintado DE
    # VOLTA no canvas original, nunca trocando o objeto.
    foreach ($tinyW in 28, 14) {
        $small = New-Canvas $tinyW ([int][Math]::Max(1, [Math]::Round($tinyW * $H / $W)))
        $gs = [System.Drawing.Graphics]::FromImage($small)
        $gs.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $gs.DrawImage($canvas, 0, 0, $small.Width, $small.Height)
        $gs.Dispose()

        $blurred = New-Canvas $W $H
        $gb = [System.Drawing.Graphics]::FromImage($blurred)
        $gb.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $gb.DrawImage($small, 0, 0, $W, $H)
        $gb.Dispose()
        $small.Dispose()

        $g.DrawImage($blurred, 0, 0)
        $blurred.Dispose()
    }

    # --- 3) Glow quente do lampião da oficina (elipses concêntricas) -----
    foreach ($pair in @(@(760, 26), @(520, 34), @(300, 42))) {
        $glowBrush = New-Object System.Drawing.SolidBrush(
            [System.Drawing.Color]::FromArgb($pair[1], $flame))
        $gw = $pair[0]
        $gh = [int]($gw * 0.55)
        $g.FillEllipse($glowBrush, [int](($W - $gw) / 2), [int](-$gh / 2 - 40), $gw, $gh)
        $glowBrush.Dispose()
    }

    # --- 4) Escurecimento em degradê (texto legível em cima do blur) ------
    $top = [System.Drawing.Color]::FromArgb(96, $ink)
    $bottom = [System.Drawing.Color]::FromArgb(205, $ink)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
    $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $top, $bottom, 90.0)
    $g.FillRectangle($grad, $rect)
    $grad.Dispose()

    # --- 5) Grain 1-bit (pontos aleatórios, semente fixa p/ reprodutível) -
    $rand = New-Object System.Random(42)
    $grainBone = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(14, $bone))
    $grainInk = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, $ink))
    for ($i = 0; $i -lt 26000; $i++) {
        $brush = if ($i % 2 -eq 0) { $grainBone } else { $grainInk }
        $g.FillRectangle($brush, $rand.Next($W), $rand.Next($H), 1, 1)
    }
    $grainBone.Dispose()
    $grainInk.Dispose()

    # --- 6) Faixa quadriculada de chegada (2 fileiras no rodapé) ---------
    $cell = 20
    $rows = 2
    $y0 = $H - ($cell * $rows)
    $sqLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(54, $bone))
    $sqDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(150, $ink))
    for ($r = 0; $r -lt $rows; $r++) {
        for ($c = 0; $c -lt [int][Math]::Ceiling($W / $cell); $c++) {
            $brush = if (($r + $c) % 2 -eq 0) { $sqLight } else { $sqDark }
            $g.FillRectangle($brush, ($c * $cell), ($y0 + $r * $cell), $cell, $cell)
        }
    }
    $sqLight.Dispose()
    $sqDark.Dispose()

    # --- 7) Wordmark -------------------------------------------------------
    # Fonte condensada: Barlow Condensed se instalada; senão fallbacks de
    # sistema (Impact/Arial Black) — pôster aguenta bem a troca.
    $installed = (New-Object System.Drawing.Text.InstalledFontCollection).Families |
        ForEach-Object { $_.Name }
    $headlineFont = @('Barlow Condensed', 'Impact', 'Arial Black', 'Arial') |
        Where-Object { $installed -contains $_ } | Select-Object -First 1
    $subFont = @('Barlow', 'Arial') |
        Where-Object { $installed -contains $_ } | Select-Object -First 1

    # Center via retângulo de layout (sobrecarga ponto+Center é ambígua);
    # Near âncora no canto superior esquerdo (p/ desenhar char a char).
    $center = New-Object System.Drawing.StringFormat(
        [System.Drawing.StringFormat]::GenericTypographic)
    $center.Alignment = [System.Drawing.StringAlignment]::Center
    $near = New-Object System.Drawing.StringFormat(
        [System.Drawing.StringFormat]::GenericTypographic)
    $near.Alignment = [System.Drawing.StringAlignment]::Near

    $title = 'VROOM'
    $size = 185
    $font = New-Object System.Drawing.Font($headlineFont, $size,
        [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    while ($g.MeasureString($title, $font, [int]::MaxValue, $near).Width -gt 860 -and $size -gt 60) {
        $size -= 6
        $font.Dispose()
        $font = New-Object System.Drawing.Font($headlineFont, $size,
            [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    }
    $titleY = 150
    $shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170, 0, 0, 0))
    $boneBrush = New-Object System.Drawing.SolidBrush($bone)
    $titleRect = New-Object System.Drawing.RectangleF(0, $titleY, $W, ($size * 1.8))
    $shadowRect = New-Object System.Drawing.RectangleF(6, ($titleY + 6), $W, ($size * 1.8))
    $g.DrawString($title, $font, $shadow, $shadowRect, $center)
    $g.DrawString($title, $font, $boneBrush, $titleRect, $center)
    $font.Dispose()

    # Subtítulo com tracking manual (Graphics não tem letter-spacing).
    $subtitle = 'UM CARRO. 5 CHUTES.'
    $size = 46
    $sub = New-Object System.Drawing.Font($subFont, $size,
        [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $tracking = 7
    $widths = @()
    $totalW = 0.0
    foreach ($ch in $subtitle.ToCharArray()) {
        $w = $g.MeasureString([string]$ch, $sub, [int]::MaxValue, $near).Width
        $widths += $w
        $totalW += $w + $tracking
    }
    $totalW -= $tracking
    $x = [float](($W - $totalW) / 2)
    $subY = [float]($titleY + 130)
    $flameBrush = New-Object System.Drawing.SolidBrush($flame)
    for ($i = 0; $i -lt $subtitle.Length; $i++) {
        $s = [string]$subtitle[$i]
        if ($s -ne ' ') {
            $g.DrawString($s, $sub, $shadow, ($x + 3), ($subY + 3), $near)
            $g.DrawString($s, $sub, $flameBrush, $x, $subY, $near)
        }
        $x += $widths[$i] + $tracking
    }
    $sub.Dispose()
    $shadow.Dispose()
    $boneBrush.Dispose()
    $flameBrush.Dispose()
    $center.Dispose()
    $near.Dispose()

    $g.Dispose()

    $dir = Split-Path -Parent $outFile
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    # JPEG q90: preview social não precisa de PNG — o grain torna o PNG
    # entropicamente caro (~1MB); JPEG fica em ~1/5 disso.
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object { $_.MimeType -eq 'image/jpeg' }
    $jpegParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $jpegParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality, [long]90)
    $canvas.Save($outFile, $jpegCodec, $jpegParams)
    $jpegParams.Dispose()
    $canvas.Dispose()
} finally {
    $src.Dispose()
}

$saved = [System.Drawing.Image]::FromFile($outFile)
try {
    Write-Host ("og.jpg gerado: {0}x{1}, {2:N0} bytes -> {3}" -f `
        $saved.Width, $saved.Height, (Get-Item $outFile).Length, $outFile)
} finally {
    $saved.Dispose()
}
