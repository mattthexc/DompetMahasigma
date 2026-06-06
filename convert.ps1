Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('D:\PROJECT RAHMAT\dompetmahasigma\public\icon-1024x1024.png')
$img.Save('D:\PROJECT RAHMAT\dompetmahasigma\public\icon-1024x1024_real.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
