$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8082/')
$listener.Start()
Write-Host 'Server started at http://localhost:8082/' -ForegroundColor Green

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $response = $context.Response
    $url = $context.Request.Url.LocalPath
    
    if ($url -eq '/') { $url = '/index.html' }
    
    $filePath = Join-Path $PSScriptRoot $url.TrimStart('/')
    
    if (Test-Path $filePath) {
        $extension = [System.IO.Path]::GetExtension($filePath)
        $contentType = switch ($extension) {
            '.html' { 'text/html' }
            '.css' { 'text/css' }
            '.js' { 'application/javascript' }
            '.json' { 'application/json' }
            '.png' { 'image/png' }
            '.jpg' { 'image/jpeg' }
            '.svg' { 'image/svg+xml' }
            '.mp3' { 'audio/mpeg' }
            '.wav' { 'audio/wav' }
            default { 'application/octet-stream' }
        }
        
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = $contentType
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $notFound = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
    }
    
    $response.Close()
}
