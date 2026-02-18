$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8888/")
$listener.Start()

Write-Host "Server started at http://localhost:8888/"
Write-Host "Press Ctrl+C to stop the server"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $url = $request.Url.LocalPath
    if ($url -eq "/") {
        $url = "/index.html"
    }
    
    $filePath = Join-Path $PSScriptRoot $url.TrimStart("/")
    
    if (Test-Path $filePath -PathType Leaf) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath)
        $response.ContentType = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".css" { "text/css; charset=utf-8" }
            ".js" { "application/javascript; charset=utf-8" }
            ".json" { "application/json; charset=utf-8" }
            ".png" { "image/png" }
            ".jpg" { "image/jpeg" }
            ".gif" { "image/gif" }
            ".svg" { "image/svg+xml" }
            ".mp3" { "audio/mpeg" }
            default { "application/octet-stream" }
        }
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $message = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.ContentLength64 = $message.Length
        $response.OutputStream.Write($message, 0, $message.Length)
    }
    
    $response.Close()
}
