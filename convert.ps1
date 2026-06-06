Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('D:\PROJECT RAHMAT\dompetmahasigma\public\icon-512x512.png')
$img.Save('D:\PROJECT RAHMAT\dompetmahasigma\public\icon-512x512_real.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
