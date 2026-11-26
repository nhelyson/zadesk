$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$svgPath = "C:\Users\japhet\Downloads\zadesk\documentation\uml\diagramme_cas_utilisation_global.svg"
$pngPath = "C:\Users\japhet\Downloads\zadesk\documentation\uml\diagramme_cas_utilisation_global.png"

# Create a small HTML wrapper
$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #ffffff; }
    img { display: block; width: 2050px; height: 1280px; }
  </style>
</head>
<body>
  <img src="file:///$($svgPath.Replace('\', '/'))" />
</body>
</html>
"@
$htmlPath = "C:\Users\japhet\Downloads\zadesk\scratch\viewer.html"
[System.IO.File]::WriteAllText($htmlPath, $htmlContent, [System.Text.Encoding]::UTF8)

# Run Edge to screenshot
$args = @(
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--hide-scrollbars",
  "--window-size=2050,1280",
  "--screenshot=$pngPath",
  "file:///$($htmlPath.Replace('\', '/'))"
)

& $edge $args
