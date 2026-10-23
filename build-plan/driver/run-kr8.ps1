# run-kr8.ps1 : detached Grok Build driver for the kr8tiv.ai improvement pass (modeled on the Hitchhiker .hh-driver\run-one.ps1).
#
# For each build-plan\prompts\NNN-*.md (sorted):
#   - SKIPPED if a depends_on prompt is BLOCKED/SKIPPED
#   - fresh headless Grok session on the default login (GROK_HOME unset):
#       grok -p=<prompt> -m grok-4.7-build-fast --effort xhigh --output-format streaming-json
#            --always-approve --sandbox workspace --cwd <repo> --deny <rules...> --rules <driver rules>
#   - leftovers are committed locally with the prompt's commit message
#   - verify: npm run build + build-plan\verify\verify.mjs (cumulative checks of DONE prompts + this one)
#   - on failure: ONE retry in a fresh session with the failure list appended
#   - still failing: branch blocked/NNN keeps the attempt, a revert commit restores the branch, prompt = BLOCKED, continue
# After every 3rd prompt and at the end: build and stage dist as a checkpoint zip in Desktop\kr8tiv-ai-checkpoints.
# NEVER pushes. The clone's push URL is disabled (NO_PUSH_DISABLED); preflight refuses to run otherwise.
#
# Files: build-plan\run.log (timeline), build-plan\state.json, build-plan\logs\NNN[.retry1].log|.err.log|.build.log|.verify.log
# Control: create build-plan\PAUSE to pause between prompts; build-plan\STOP to stop after the current prompt.
# Launch detached:
#   Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','C:\Users\lucid\Desktop\kr8tiv-ai-wt\build-plan\driver\run-kr8.ps1'
# Options: -SmokeTest (one tiny Grok call with the full flag set), -VerifyOnly 'nav,scrim' (run the verifier once), -Only 003
param([switch]$SmokeTest, [string]$VerifyOnly = '', [string]$Only = '')

$ErrorActionPreference = 'Continue'
$Root      = 'C:\Users\lucid\Desktop\kr8tiv-ai-wt'
$Plan      = Join-Path $Root 'build-plan'
$PromptDir = Join-Path $Plan 'prompts'
$LogDir    = Join-Path $Plan 'logs'
$RunLog    = Join-Path $Plan 'run.log'
$StateFile = Join-Path $Plan 'state.json'
$LockFile  = Join-Path $Plan 'driver.pid'
$PauseFile = Join-Path $Plan 'PAUSE'
$StopFile  = Join-Path $Plan 'STOP'
$EmptyIn   = Join-Path $LogDir 'empty-stdin.txt'
$CpDir     = 'C:\Users\lucid\Desktop\kr8tiv-ai-checkpoints'
$RunsDir   = 'C:\Users\lucid\Desktop\kr8tiv-ai-runs'
$Grok      = 'C:\Users\lucid\.grok\bin\grok.exe'
$Model     = 'grok-4.7-build-fast'
$Effort    = 'xhigh'
$Branch    = 'improve-2026-10'
$BaseSha   = '9a46644294d3fc42b21c101865bdcb0ee9599b96'
$StallMin  = 30; $CapMin = 150; $DoneQuietMin = 3; $PollSec = 20

New-Item -ItemType Directory -Force $LogDir, $CpDir, $RunsDir | Out-Null
if (-not (Test-Path $EmptyIn)) { [IO.File]::WriteAllText($EmptyIn, '') }
Remove-Item Env:GROK_HOME, Env:GROK_SANDBOX, Env:CI -ErrorAction SilentlyContinue

function L($m) { $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $m"; Add-Content -Path $RunLog -Value $line -Encoding UTF8; Write-Output $line }
function G { $o = & git -C $Root @args 2>&1; $script:GitCode = $LASTEXITCODE; @($o | ForEach-Object { "$_" }) }
function Head { (G rev-parse HEAD | Select-Object -First 1) }
function Dirty { @(G status --porcelain | Where-Object { $_.Trim() }) }

# ---------- state ----------
$State = @{ prompts = @{}; current = ''; status = 'idle'; updated = ''; pid = $PID; checkpoints = @() }
if (Test-Path $StateFile) {
  try {
    $old = Get-Content $StateFile -Raw | ConvertFrom-Json
    foreach ($pp in $old.prompts.PSObject.Properties) { $h = @{}; foreach ($q in $pp.Value.PSObject.Properties) { $h[$q.Name] = $q.Value }; $State.prompts[$pp.Name] = $h }
    if ($old.checkpoints) { $State.checkpoints = @($old.checkpoints) }
  } catch { }
}
function Save([hashtable]$kv) {
  foreach ($k in $kv.Keys) { $State[$k] = $kv[$k] }
  $State.updated = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'); $State.pid = $PID
  [IO.File]::WriteAllText($StateFile, ($State | ConvertTo-Json -Depth 6), (New-Object Text.UTF8Encoding $false))
}
function SetP($id, [hashtable]$kv) { if (-not $State.prompts.ContainsKey($id)) { $State.prompts[$id] = @{} }; foreach ($k in $kv.Keys) { $State.prompts[$id][$k] = $kv[$k] }; Save @{} }
function PStatus($id) { if ($State.prompts.ContainsKey($id)) { "$($State.prompts[$id].status)" } else { '' } }

# ---------- quoting (MSVC/Rust argv rules), same as the Hitchhiker driver ----------
function Q([string]$s) {
  if ($s -eq '') { return '""' }
  if ($s -notmatch '[\s"]') { return $s }
  $sb = New-Object System.Text.StringBuilder; [void]$sb.Append('"'); $bs = 0
  foreach ($ch in $s.ToCharArray()) {
    if ($ch -eq [char]92) { $bs++; continue }
    if ($ch -eq [char]34) { [void]$sb.Append([string][char]92 * ($bs * 2 + 1)); [void]$sb.Append([char]34); $bs = 0; continue }
    if ($bs -gt 0) { [void]$sb.Append([string][char]92 * $bs); $bs = 0 }
    [void]$sb.Append($ch)
  }
  if ($bs -gt 0) { [void]$sb.Append([string][char]92 * ($bs * 2)) }
  [void]$sb.Append('"'); $sb.ToString()
}

$DenyRules = @(
  'Bash(*git push*)', 'Bash(*git remote*)', 'Bash(*git reset --hard*)', 'Bash(*git clean -*)', 'Bash(*git filter-branch*)', 'Bash(*git rebase*)',
  'Bash(*git checkout master*)', 'Bash(*git checkout main*)', 'Bash(*git switch master*)', 'Bash(*git switch main*)', 'Bash(*git branch -D*)', 'Bash(*git branch -f*)',
  'Bash(*git config --global*)', 'Bash(*--no-verify*)', 'Bash(*--force*)', 'Bash(*push --*)',
  'Bash(*ftp_deploy*)', 'Bash(*ftplib*)', 'Bash(*firebase deploy*)', 'Bash(*firebase hosting*)', 'Bash(*hostinger*)', 'Bash(*hpanel*)', 'Bash(*hstgr*)',
  'Bash(*vercel*)', 'Bash(*netlify deploy*)', 'Bash(*wrangler*)', 'Bash(*npm publish*)', 'Bash(*gh release*)', 'Bash(*gh repo*)', 'Bash(*gh pr*)', 'Bash(*gh api*)',
  'Bash(*grok login*)', 'Bash(*grok logout*)', 'Bash(*GROK_HOME*)',
  'Bash(*taskkill*)', 'Bash(*Stop-Process*)', 'Bash(*pkill*)', 'Bash(*killall*)', 'Bash(*wmic*)',
  'Bash(*Set-ExecutionPolicy*)', 'Bash(*Set-MpPreference*)', 'Bash(*reg add*)', 'Bash(*reg delete*)', 'Bash(*bcdedit*)', 'Bash(*netsh*)', 'Bash(*schtasks*)', 'Bash(*shutdown*)',
  'Bash(*Remove-Item*C:\Users\lucid\*-Recurse*)', 'Bash(*rm -rf ~*)', 'Bash(*rm -rf /*)',
  'Read(**/.ssh/**)', 'Read(**/.git-credentials)', 'Read(**/.grok/auth*)', 'Read(**/.grok/*token*)', 'Read(**/.grok/*cred*)', 'Read(**/.env)', 'Read(**/.env.*)',
  'Edit(**/build-plan/verify/**)', 'Edit(**/build-plan/driver/**)', 'Edit(**/build-plan/prompts/**)', 'Edit(**/build-plan/CONTEXT.md)', 'Edit(**/build-plan/INDEX.md)',
  'Write(**/build-plan/verify/**)', 'Write(**/build-plan/driver/**)', 'Write(**/build-plan/prompts/**)', 'Write(**/build-plan/CONTEXT.md)', 'Write(**/build-plan/INDEX.md)',
  'Edit(**/ftp_deploy.py)', 'Write(**/ftp_deploy.py)'
)
$DriverRules = 'You are running headless under an automated build driver in ' + $Root + ' on local branch ' + $Branch + '. Read build-plan/CONTEXT.md first and obey its hard rules. ' +
  'Never git push, never touch remotes, never switch branches, never deploy (no ftp_deploy.py, no firebase, nothing that talks to Hostinger, DNS or the live kr8tiv.ai). ' +
  'Never invent business facts: keep existing copy or leave a TODO(Matt) code comment. Crypto is out of scope. Do not remove JARVIS/KIN content; flag it with TODO(Matt) instead. ' +
  'Do not edit build-plan/verify, build-plan/driver, build-plan/prompts, CONTEXT.md or INDEX.md. Do not sign in or out of Grok or change GROK_HOME. ' +
  'Do not stop or kill processes you did not start; stop any dev/preview server you start before you finish. Never print or commit secrets. ' +
  'Use PowerShell syntax (no && chaining; use ;). When done, commit with the exact message in the prompt''s Commit message section and leave the working tree clean. ' +
  'Nobody can answer questions: make the reasonable choice, note it in the commit body, and keep going.'

function Build-Args([string]$text, [string]$path = '') {
  $pa = (Q ('-p=' + $text))
  if ($path -and $pa.Length -gt 22000) { $pa = '--prompt-file ' + (Q $path) }
  $a = @($pa, '-m', $Model, '--effort', $Effort, '--output-format', 'streaming-json', '--always-approve', '--sandbox', 'workspace', '--cwd', (Q $Root))
  foreach ($d in $DenyRules) { $a += @('--deny', (Q $d)) }
  $a += @('--rules', (Q $DriverRules))
  ($a -join ' ')
}

function Kill-Tree([int]$id) {
  $kids = @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$id" -ErrorAction SilentlyContinue)
  foreach ($k in $kids) { Kill-Tree ([int]$k.ProcessId) }
  Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
}

function Is-UsageLimit([string]$log, [string]$err) {
  $tail = @()
  if (Test-Path $err) { $tail += Get-Content $err -Tail 60 -ErrorAction SilentlyContinue }
  if (Test-Path $log) { $tail += @(Get-Content $log -Tail 40 -ErrorAction SilentlyContinue | Where-Object { $_ -match '"type":"(error|end)"' -or $_ -notmatch '^\{' }) }
  $t = ($tail -join "`n")
  return ($t -match '(?i)usage limit|rate.?limit(ed)?\b.*(reached|exceeded)|quota|limit (reached|exceeded)|too many requests|\b429\b|insufficient (credit|balance)|out of credits|subscription limit|upgrade your plan|\b402\b|payment required|balance exhausted')
}

# One Grok session. Returns ok | stall | cap | usage | fail
function Run-Once($p, [int]$attempt, [string]$extra) {
  $suffix = $(if ($attempt -gt 1) { ".retry$($attempt - 1)" } else { '' })
  $log = Join-Path $LogDir "$($p.id)$suffix.log"; $err = Join-Path $LogDir "$($p.id)$suffix.err.log"
  $text = $p.text + $extra
  $ppath = $p.path
  if ($extra) { $ppath = Join-Path $LogDir "$($p.id)$suffix.prompt.md"; [IO.File]::WriteAllText($ppath, $text, (New-Object Text.UTF8Encoding $false)) }
  $argStr = Build-Args $text $ppath
  SetP $p.id @{ status = 'running'; attempt = $attempt; started = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') }
  Save @{ current = $p.id; status = "running $($p.id) attempt $attempt" }
  L "START $($p.id) $($p.name) attempt=$attempt model=$Model effort=$Effort argsLen=$($argStr.Length)"
  $proc = $null
  try {
    $proc = Start-Process -FilePath $Grok -ArgumentList $argStr -WorkingDirectory $Root -NoNewWindow -PassThru `
              -RedirectStandardOutput $log -RedirectStandardError $err -RedirectStandardInput $EmptyIn -ErrorAction Stop
  } catch { L "SPAWN ERROR $($p.id): $($_.Exception.Message)"; return 'fail' }
  $null = $proc.Handle
  L "SPAWNED $($p.id) grok pid $($proc.Id)"
  $lastSize = -1; $lastGrow = Get-Date; $t0 = Get-Date; $startHead = Head
  while (-not $proc.HasExited) {
    Start-Sleep -Seconds $PollSec
    $size = 0; foreach ($f in @($log, $err)) { if (Test-Path $f) { $size += (Get-Item $f).Length } }
    if ($size -ne $lastSize) { $lastSize = $size; $lastGrow = Get-Date }
    if (((Get-Date) - $t0).TotalMinutes -ge $CapMin) { L "CAP $($p.id): over $CapMin min; killing grok pid $($proc.Id)"; Kill-Tree $proc.Id; Start-Sleep 5; return 'cap' }
    if ($size -eq $lastSize -and ((Get-Date) - $lastGrow).TotalMinutes -ge $DoneQuietMin -and (Head) -ne $startHead -and -not (Dirty).Count -and (@(G log "$startHead..HEAD" --format=%s) -match "\($($p.id)\)").Count) {
      $lastLine = @(Get-Content $log -Tail 40 -ErrorAction SilentlyContinue | Where-Object { $_ -match '^\{"type":"(text|tool_call|tool_call_update|thought|end)"' } | Select-Object -Last 1)
      if ($lastLine.Count -and $lastLine[0] -match '^\{"type":"(text|end)"') { L "FINISHED-HANG $($p.id): commit landed, tree clean, quiet $DoneQuietMin min; killing grok pid $($proc.Id)"; Kill-Tree $proc.Id; Start-Sleep 5; return 'ok' }
    }
    if (((Get-Date) - $lastGrow).TotalMinutes -ge $StallMin) { L "STALL $($p.id): no log growth for $StallMin min; killing grok pid $($proc.Id)"; Kill-Tree $proc.Id; Start-Sleep 5; return 'stall' }
  }
  $proc.WaitForExit(); $code = $proc.ExitCode
  $end = @(Get-Content $log -Tail 80 -ErrorAction SilentlyContinue | Where-Object { $_ -match '^\{"type":"end"' } | Select-Object -Last 1)
  $stop = ''; if ($end.Count) { try { $stop = ($end[0] | ConvertFrom-Json).stopReason } catch {} }
  L "EXIT $($p.id) code=$code stopReason=$stop logBytes=$((Get-Item $log -ErrorAction SilentlyContinue).Length) minutes=$([int]((Get-Date) - $t0).TotalMinutes)"
  if (Is-UsageLimit $log $err) { if ($code -ne 0 -or -not $end.Count -or $stop -ne 'end_turn') { return 'usage' } }
  if ($code -ne 0 -and -not $end.Count) { return 'fail' }
  return 'ok'
}

function Read-Prompt($file) {
  $text = [IO.File]::ReadAllText($file.FullName, [Text.Encoding]::UTF8)
  $fm = ''; if ($text -match '(?s)^---\r?\n(.*?)\r?\n---') { $fm = $Matches[1] }
  $id = $file.Name.Split('-')[0]
  $kind = $(if ($fm -match '(?m)^kind:\s*"?([\w-]+)') { $Matches[1] } else { 'build' })
  $deps = @(); if ($fm -match '(?m)^depends_on:\s*\[(.*)\]') { $deps = @($Matches[1] -split ',' | ForEach-Object { $_.Trim().Trim('"').Trim("'") } | Where-Object { $_ }) }
  $checks = @(); if ($fm -match '(?m)^checks:\s*\[(.*)\]') { $checks = @($Matches[1] -split ',' | ForEach-Object { $_.Trim().Trim('"').Trim("'") } | Where-Object { $_ }) }
  $lh = ($fm -match '(?m)^lighthouse:\s*true')
  $msg = "build($id): $($file.BaseName)"
  if ($text -match '(?s)## Commit message\s*\r?\n\s*```[^\n]*\r?\n(.*?)\r?\n```') { $msg = $Matches[1].Trim() }
  [pscustomobject]@{ id = $id; name = $file.Name; path = $file.FullName; text = $text; kind = $kind; deps = $deps; checks = $checks; lh = $lh; msg = $msg }
}

# npm run build + verifier. Returns @{ ok; summary }
function Verify($p, [string[]]$checks, [bool]$lh, [string]$tag) {
  $blog = Join-Path $LogDir "$tag.build.log"; $vlog = Join-Path $LogDir "$tag.verify.log"
  Push-Location $Root
  cmd /c "npm run build > `"$blog`" 2>&1"; $bc = $LASTEXITCODE
  if ($bc -ne 0) { Pop-Location; $t = (Get-Content $blog -Tail 30) -join "`n"; L "VERIFY ${tag}: npm run build FAILED (exit $bc)"; return @{ ok = $false; summary = "npm run build failed (exit $bc). Tail of the build log:`n$t" } }
  $ck = ($checks | Where-Object { $_ } | Select-Object -Unique) -join ','
  $lhArg = $(if ($lh) { '--lighthouse' } else { '' })
  cmd /c "node build-plan\verify\verify.mjs --checks `"$ck`" $lhArg --tag $tag --out `"$RunsDir\$tag`" > `"$vlog`" 2>&1"; $vc = $LASTEXITCODE
  Pop-Location
  $lines = @(Get-Content $vlog -ErrorAction SilentlyContinue)
  foreach ($x in ($lines | Where-Object { $_ -match '^(VERIFY|LIGHTHOUSE|INFO) ' })) { L "  $tag $x" }
  if ($vc -ne 0) {
    $fails = @($lines | Where-Object { $_ -match '^(FAIL|HARNESS)' } | Select-Object -First 40)
    L "VERIFY $tag FAILED ($($fails.Count) lines, checks=$ck)"
    return @{ ok = $false; summary = "Verifier (checks: $ck) failed:`n" + ($fails -join "`n") }
  }
  L "VERIFY $tag PASS (checks=$ck)"
  return @{ ok = $true; summary = '' }
}

function Guard($before, [string]$id) {
  $bad = @()
  $br = (G rev-parse --abbrev-ref HEAD | Select-Object -First 1)
  if ($br -ne $Branch) { $bad += "branch is '$br', expected $Branch" }
  $m = (G rev-parse refs/heads/master | Select-Object -First 1)
  if ($m -ne $BaseSha) { $bad += "local master moved to $m" }
  $pu = (G remote get-url --push origin | Select-Object -First 1)
  if ($pu -ne 'NO_PUSH_DISABLED') { $bad += "origin push URL changed to '$pu'" }
  $touched = @(G diff --name-only "$before..HEAD" | Where-Object { $_ -match '^build-plan/(verify|driver|prompts)/|^build-plan/(CONTEXT|INDEX)\.md$' })
  if ($touched.Count) { $bad += "driver-owned files changed: $($touched -join ', ')" }
  return $bad
}

function Checkpoint([string]$label) {
  L "CHECKPOINT ${label}: building"
  Push-Location $Root; cmd /c "npm run build > `"$LogDir\cp-$label.build.log`" 2>&1"; $bc = $LASTEXITCODE; Pop-Location
  if ($bc -ne 0) { L "CHECKPOINT ${label}: build FAILED (exit $bc); no checkpoint"; return }
  $dest = Join-Path $CpDir "cp-$label"; $zip = "$dest.zip"
  Remove-Item $zip -Force -ErrorAction SilentlyContinue
  robocopy "$Root\dist" $dest /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [IO.Compression.ZipFile]::CreateFromDirectory($dest, $zip)
  $h = Head
  [IO.File]::WriteAllText((Join-Path $CpDir 'LATEST.txt'), "cp-$label $h $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')", (New-Object Text.UTF8Encoding $false))
  $State.checkpoints = @($State.checkpoints) + @("cp-$label $h"); Save @{}
  L "CHECKPOINT $label ready: $zip at $h"
}

# ---------- modes ----------
if ($SmokeTest) {
  $a = Build-Args 'Reply with exactly the word READY and nothing else. Do not use any tools.'
  $out = Join-Path $LogDir 'smoke.log'
  $pr = Start-Process -FilePath $Grok -ArgumentList $a -WorkingDirectory $Root -NoNewWindow -PassThru -Wait -RedirectStandardOutput $out -RedirectStandardError "$out.err" -RedirectStandardInput $EmptyIn
  Write-Output "exit=$($pr.ExitCode) argsLen=$($a.Length)"
  Get-Content $out | Where-Object { $_ -match '"type":"(text|end|error)"' } | ForEach-Object { $_.Substring(0, [Math]::Min(300, $_.Length)) }
  Get-Content "$out.err" -ErrorAction SilentlyContinue | Select-Object -Last 10
  exit 0
}
if ($VerifyOnly) { $r = Verify $null @($VerifyOnly -split ',') $true "verifyonly-$(Get-Date -Format 'HHmmss')"; Write-Output $r.summary; exit $(if ($r.ok) { 0 } else { 1 }) }

# ---------- single instance ----------
if (Test-Path $LockFile) {
  $op = (Get-Content $LockFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($op -and (Get-Process -Id ([int]$op) -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -match 'powershell|pwsh' })) { L "another driver is running (pid $op); exiting"; exit 1 }
}
Set-Content $LockFile $PID
try {
  $pre = Guard (Head) 'pre'
  if ($pre.Count) { L "PREFLIGHT FAILED: $($pre -join '; ')"; Save @{ status = 'preflight failed' }; exit 2 }
  $files = @(Get-ChildItem $PromptDir -Filter '*.md' | Where-Object { $_.Name -match '^\d{3}-' } | Sort-Object Name)
  if ($Only) { $files = @($files | Where-Object { $_.Name.StartsWith($Only) }) }
  L "driver start pid=$PID prompts=$($files.Count) head=$(Head) model=$Model effort=$Effort"
  $n = 0
  foreach ($f in $files) {
    $p = Read-Prompt $f; $n++
    $st = PStatus $p.id
    if ($st -in @('DONE', 'BLOCKED', 'SKIPPED')) { L "skip $($p.id): already $st"; continue }
    if (Test-Path $StopFile) { L "STOP file present; stopping before $($p.id)"; Save @{ status = "stopped before $($p.id)" }; break }
    while (Test-Path $PauseFile) { Save @{ status = "paused before $($p.id)" }; Start-Sleep 30 }
    $badDep = @($p.deps | Where-Object { (PStatus $_) -in @('BLOCKED', 'SKIPPED') })
    if ($badDep.Count) { L "SKIPPED $($p.id): depends on $($badDep -join ',') which is BLOCKED/SKIPPED"; SetP $p.id @{ status = 'SKIPPED'; reason = "depends on $($badDep -join ',')" } }
    else {
      $d = Dirty
      if ($d.Count) { L "tree dirty before $($p.id): $($d -join '; '); stopping"; Save @{ status = "stopped: dirty tree before $($p.id)" }; exit 3 }
      $before = Head
      $doneChecks = @(); foreach ($k in $State.prompts.Keys) { if ($State.prompts[$k].status -eq 'DONE' -and $State.prompts[$k].checks) { $doneChecks += @("$($State.prompts[$k].checks)" -split ',') } }
      $checks = @($doneChecks + $p.checks | Where-Object { $_ } | Select-Object -Unique)
      $extra = ''; $ok = $false; $why = ''
      for ($attempt = 1; $attempt -le 2 -and -not $ok; $attempt++) {
        $r = Run-Once $p $attempt $extra
        if ($r -eq 'usage') { L "USAGE LIMIT during $($p.id); stopping the whole run (relaunch resumes)"; SetP $p.id @{ status = 'pending'; note = 'usage limit' }; Save @{ status = "stopped: usage limit at $($p.id)" }; exit 4 }
        $d = Dirty
        if ($d.Count) {
          L "$($p.id) attempt $attempt left $($d.Count) uncommitted path(s); committing with the prompt's message"
          $null = G add -A; $null = G commit -m $p.msg -m "Committed by build-plan/driver after the Grok session ended with a dirty tree (attempt $attempt)."
        }
        $g = Guard $before $p.id
        if ($g.Count) { L "GUARD FAILED after $($p.id): $($g -join '; '); stopping the whole run"; Save @{ status = "stopped: guard failed at $($p.id)" }; exit 6 }
        if ((Head) -eq $before) { $why = "Grok session ended ($r) with no changes"; L "$($p.id) attempt ${attempt}: $why" }
        else {
          $tag = "$($p.id)-a$attempt"
          $v = Verify $p $checks $p.lh $tag
          if ($v.ok) { $ok = $true; break }
          $why = $v.summary
        }
        if ($attempt -eq 1) {
          L "retrying $($p.id) in a fresh session"
          $extra = "`n`n## Retry note from the driver`nThe previous attempt (its work, if any, is already committed on this branch; HEAD $(Head)) did not pass. Result: $r.`n$why`n`nFix exactly these failures with the smallest correct change while keeping everything the prompt asks for, re-run the verification yourself, then commit with the same commit message."
        }
      }
      if ($ok) {
        $h = Head; $cnt = @(G rev-list --count "$before..$h")[0]
        L "DONE $($p.id): $cnt commit(s), HEAD $h : $(@(G log -1 --format=%s)[0])"
        SetP $p.id @{ status = 'DONE'; commit = $h; checks = ($p.checks -join ','); finished = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') }
      } else {
        $h = Head
        if ($h -ne $before) {
          $null = G branch -f "blocked/$($p.id)" $h
          $null = G revert --no-edit --no-commit "$before..$h"
          if ($GitCode -ne 0) { L "revert of $($p.id) failed; stopping"; Save @{ status = "stopped: revert failed at $($p.id)" }; exit 7 }
          $null = G commit -m "revert($($p.id)): blocked after one retry; attempt kept on branch blocked/$($p.id)"
        }
        $short = ($why -split "`n" | Select-Object -First 6) -join ' / '
        L "BLOCKED $($p.id): failed after one retry. $short"
        SetP $p.id @{ status = 'BLOCKED'; attempt_head = $h; reason = $short; finished = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') }
      }
    }
    if ($n % 3 -eq 0 -and $n -lt $files.Count) { Checkpoint $p.id }
  }
  if (-not (Test-Path $StopFile) -and -not $Only) { Checkpoint 'final'; L 'all prompts processed'; Save @{ status = 'complete'; current = '' } }
}
finally { Remove-Item $LockFile -ErrorAction SilentlyContinue }
