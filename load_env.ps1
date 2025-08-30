# Load only the non-conflicting vars
foreach ($line in Get-Content .env) {
    if ($line -match '^([^#][^=]+)=(.+)$' -and $matches[1] -ne 'ANTHROPIC_API_KEY') {
        [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
    }
}

# Start Claude Code (should work now)
claude