$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8081/')
$listener.Start()
Write-Host 'Server started at http://localhost:8081/' -ForegroundColor Green
Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $localPath = Join-Path $PWD ($request.Url.LocalPath -replace '^/', '')
    
    if ([string]::IsNullOrEmpty($localPath) -or -not (Test-Path $localPath)) {
        $localPath = Join-Path $PWD 'index.html'
    }
    
    if (Test-Path $localPath) {
        $content = [System.IO.File]::ReadAllBytes($localPath)
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
        
        $ext = [System.IO.Path]::GetExtension($localPath)
        switch ($ext) {
            '.html' { $response.ContentType = 'text/html; charset=utf-8' }
            '.css' { $response.ContentType = 'text/css; charset=utf-8' }
            '.js' { $response.ContentType = 'application/javascript; charset=utf-8' }
            '.mp3' { $response.ContentType = 'audio/mpeg' }
            default { $response.ContentType = 'application/octet-stream' }
        }
    } else {
        $response.StatusCode = 404
    }
    
    $response.Close()
}
