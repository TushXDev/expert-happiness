# 🚀 Quick Deployment to GitHub Pages

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🌿 craftGPT - GitHub Pages Deployment" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "📥 Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Git is installed" -ForegroundColor Green
Write-Host ""

# Check if already initialized
$gitExists = Test-Path ".git"

if (-not $gitExists) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📝 GitHub Setup" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get GitHub username
Write-Host "Enter your GitHub username:" -ForegroundColor Cyan
$githubUsername = Read-Host

if ([string]::IsNullOrWhiteSpace($githubUsername)) {
    Write-Host "❌ GitHub username is required!" -ForegroundColor Red
    pause
    exit 1
}

# Get repository name
Write-Host ""
Write-Host "Enter repository name (default: ethos):" -ForegroundColor Cyan
$repoName = Read-Host
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "ethos"
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📤 Preparing files for deployment..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

# Add all files
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
} else {
    # Commit
    Write-Host "💾 Committing files..." -ForegroundColor Yellow
    git commit -m "Initial deployment: craftGPT with offline chat history"
    Write-Host "✅ Files committed" -ForegroundColor Green
}

Write-Host ""

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host "🔗 Adding remote repository..." -ForegroundColor Yellow
    git remote add origin "https://github.com/$githubUsername/$repoName.git"
    Write-Host "✅ Remote added" -ForegroundColor Green
} else {
    Write-Host "✅ Remote already configured: $remoteExists" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 Ready to Push!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  Before pushing, make sure you have:" -ForegroundColor Yellow
Write-Host "   1. Created the repository on GitHub:" -ForegroundColor White
Write-Host "      https://github.com/new" -ForegroundColor Cyan
Write-Host "   2. Repository name: $repoName" -ForegroundColor White
Write-Host "   3. Set visibility to: Public (required for free GitHub Pages)" -ForegroundColor White
Write-Host "   4. Do NOT initialize with README" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue with push, or Ctrl+C to cancel..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow

# Set branch to main
git branch -M main

# Push to GitHub
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to your repository:" -ForegroundColor White
    Write-Host "   https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Click 'Settings' (top menu)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Click 'Pages' (left sidebar)" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Under 'Source', select: GitHub Actions" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Wait 2-3 minutes for deployment" -ForegroundColor White
    Write-Host ""
    Write-Host "6. Your site will be live at:" -ForegroundColor White
    Write-Host "   https://$githubUsername.github.io/$repoName/" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📖 For detailed instructions, see:" -ForegroundColor Yellow
    Write-Host "   GITHUB_PAGES_DEPLOYMENT.md" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "❌ Push Failed!" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Common Issues:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Repository doesn't exist on GitHub" -ForegroundColor White
    Write-Host "   → Create it at: https://github.com/new" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Authentication failed" -ForegroundColor White
    Write-Host "   → Use Personal Access Token instead of password" -ForegroundColor Cyan
    Write-Host "   → Generate token at: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Permission denied" -ForegroundColor White
    Write-Host "   → Make sure you own the repository" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
