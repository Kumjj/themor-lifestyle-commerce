#Requires -RunAsAdministrator
param([switch]$Confirmed)
$ErrorActionPreference = 'Stop'

# Prepared recovery procedure. Nothing runs merely by opening this file.
# Uses MySQL's documented init-file method; never disables authentication.
$projectDirectory = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectDirectory 'server/.env'
$serviceName = 'MySQL80'
$mysqlDirectory = 'C:/Program Files/MySQL/MySQL Server 8.0/bin'
$defaultsFile = 'C:/ProgramData/MySQL/MySQL Server 8.0/my.ini'
$mysqlServer = Join-Path $mysqlDirectory 'mysqld.exe'
$mysqlClient = Join-Path $mysqlDirectory 'mysql.exe'
$mysqlAdmin = Join-Path $mysqlDirectory 'mysqladmin.exe'
$statusFile = Join-Path $projectDirectory 'server/mysql-recovery-status.json'
function Set-RecoveryStatus([string]$state, [string]$code = '') {
    $status = @{ state = $state; code = $code; time = [DateTime]::UtcNow.ToString('o') } | ConvertTo-Json -Compress
    [IO.File]::WriteAllText($statusFile, $status, (New-Object System.Text.UTF8Encoding($false)))
}
trap {
    Set-RecoveryStatus 'failed' $_.Exception.GetType().Name
    exit 1
}

if (!(Test-Path -LiteralPath $envFile) -or !(Test-Path -LiteralPath $defaultsFile)) { throw 'Project environment file or MySQL configuration was not found.' }
$service = Get-Service -Name $serviceName
if ($service.Status -ne 'Running') { throw 'MySQL80 must be running before this procedure starts.' }

Write-Host 'This resets only MySQL root@localhost and restarts MySQL80.'
Write-Host 'Existing databases and the MySQL service configuration are retained.'
if (!$Confirmed) {
    $confirmation = Read-Host 'Type RESET to continue, or press Enter to cancel'
    if ($confirmation -cne 'RESET') { Set-RecoveryStatus 'cancelled'; Write-Host 'Cancelled.'; exit 0 }
}
Set-RecoveryStatus 'starting'

$recoveryDirectory = Join-Path $env:TEMP ('themor-mysql-recovery-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $recoveryDirectory | Out-Null
$directoryAcl = New-Object System.Security.AccessControl.DirectorySecurity
$directoryAcl.SetAccessRuleProtection($true, $false)
$currentIdentity = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
$systemIdentity = New-Object System.Security.Principal.SecurityIdentifier('S-1-5-18')
foreach ($identity in @($currentIdentity, $systemIdentity)) {
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($identity, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
    $directoryAcl.AddAccessRule($rule)
}
Set-Acl -LiteralPath $recoveryDirectory -AclObject $directoryAcl

$random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 24
$random.GetBytes($bytes)
$random.Dispose()
$newPassword = 'Aa7!' + [Convert]::ToBase64String($bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=')
$initFile = Join-Path $recoveryDirectory 'init.sql'
$clientFile = Join-Path $recoveryDirectory 'client.ini'
$outputFile = Join-Path $recoveryDirectory 'server.log'
$errorFile = Join-Path $recoveryDirectory 'server-error.log'
$utf8 = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($initFile, "ALTER USER 'root'@'localhost' IDENTIFIED BY '$newPassword';", $utf8)
[IO.File]::WriteAllText($clientFile, "[client]`r`nuser=root`r`npassword=$newPassword`r`nhost=127.0.0.1`r`nport=3306`r`nprotocol=TCP`r`n", $utf8)

# Store the new credential locally before changing it, so an interrupted recovery
# cannot leave the newly assigned password unknown. The file is excluded from Git.
$originalEnv = [IO.File]::ReadAllText($envFile)
$updatedEnv = [regex]::Replace($originalEnv, '(?m)^DB_USER=.*$', 'DB_USER=root')
$updatedEnv = [regex]::Replace($updatedEnv, '(?m)^DB_PASSWORD=.*$', ('DB_PASSWORD="' + $newPassword + '"'))
[IO.File]::WriteAllText($envFile, $updatedEnv, $utf8)
$recoveryProcess = $null
$verified = $false

try {
    Stop-Service -Name $serviceName
    (Get-Service $serviceName).WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
    Set-RecoveryStatus 'service-stopped'
    $arguments = @(
        ('--defaults-file="' + $defaultsFile + '"'),
        ('--init-file="' + $initFile + '"'),
        '--bind-address=127.0.0.1', '--port=3306', '--mysqlx=0', '--console'
    )
    $recoveryProcess = Start-Process -FilePath $mysqlServer -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardOutput $outputFile -RedirectStandardError $errorFile
    for ($attempt = 0; $attempt -lt 45; $attempt++) {
        Start-Sleep -Seconds 1
        $recoveryProcess.Refresh()
        if ($recoveryProcess.HasExited) { throw 'MySQL recovery startup failed. The new proposed password remains in server/.env.' }
        $previousErrorPreference = $ErrorActionPreference
        $ErrorActionPreference = 'SilentlyContinue'
        try {
            $probe = & $mysqlClient "--defaults-extra-file=$clientFile" --connect-timeout=2 --batch --skip-column-names '--execute=SELECT CURRENT_USER();' 2>$null
            $probeExitCode = $LASTEXITCODE
        } finally { $ErrorActionPreference = $previousErrorPreference }
        if ($probeExitCode -eq 0 -and $probe -match '^root@localhost$') { $verified = $true; break }
    }
    if (!$verified) { throw 'Could not verify the reset within the startup timeout.' }
    Set-RecoveryStatus 'password-verified'
    Write-Host 'New root password verified. It is stored only in server/.env, not printed here.'
} finally {
    if ($recoveryProcess) {
        $recoveryProcess.Refresh()
        if (!$recoveryProcess.HasExited) {
            $previousErrorPreference = $ErrorActionPreference
            $ErrorActionPreference = 'SilentlyContinue'
            try { & $mysqlAdmin "--defaults-extra-file=$clientFile" --connect-timeout=3 shutdown 2>$null | Out-Null }
            finally { $ErrorActionPreference = $previousErrorPreference }
            if (!$recoveryProcess.WaitForExit(15000)) {
                Write-Warning 'Recovery MySQL is still running. Do not start a second server on the same data directory.'
            }
        }
    }
    if (!$recoveryProcess -or $recoveryProcess.HasExited) {
        if ((Get-Service $serviceName).Status -ne 'Running') { Start-Service -Name $serviceName }
        (Get-Service $serviceName).WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
        foreach ($file in @($initFile, $clientFile, $outputFile, $errorFile)) {
            if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file -Force }
        }
        Remove-Item -LiteralPath $recoveryDirectory -Force
    }
    $newPassword = $null
}

if ($verified) {
    Set-RecoveryStatus 'complete'
    Write-Host 'MySQL80 restarted. Next: npm run db:setup, then npm run db:check.'
    Write-Host 'Workbench should use Username=root and the password saved in server/.env.'
}
