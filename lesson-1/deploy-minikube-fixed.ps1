# NestJS Application Deployment Script for Minikube (PowerShell)
# This script sets up the complete Kubernetes environment on Windows

param(
    [Parameter(Position=0)]
    [string]$Action = "deploy"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Cyan"
    White = "White"
}

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

# Check if required tools are installed
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    $tools = @("minikube", "kubectl", "docker")
    $missing = @()
    
    foreach ($tool in $tools) {
        try {
            $null = Get-Command $tool -ErrorAction Stop
            Write-Host "✓ $tool is installed" -ForegroundColor $Colors.Green
        }
        catch {
            $missing += $tool
            Write-Host "✗ $tool is not installed" -ForegroundColor $Colors.Red
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing tools: $($missing -join ', ')"
        Write-Host ""
        Write-Host "Please install the missing tools:"
        foreach ($tool in $missing) {
            switch ($tool) {
                "minikube" { Write-Host "  choco install minikube" }
                "kubectl" { Write-Host "  choco install kubernetes-cli" }
                "docker" { Write-Host "  Download Docker Desktop from https://www.docker.com/products/docker-desktop/" }
            }
        }
        exit 1
    }
    
    Write-Success "All prerequisites are installed"
}

# Start Minikube with required addons
function Start-Minikube {
    Write-Status "Starting Minikube..."
    
    # Check if Minikube is already running
    try {
        $status = minikube status 2>$null
        if ($status -match "Running") {
            Write-Warning "Minikube is already running"
        } else {
            Write-Status "Starting Minikube with Docker driver..."
            minikube start --driver=docker
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Minikube started successfully"
            } else {
                Write-Error "Failed to start Minikube"
                exit 1
            }
        }
    }
    catch {
        Write-Error "Error checking Minikube status: $_"
        exit 1
    }
    
    # Enable required addons
    Write-Status "Enabling Minikube addons..."
    minikube addons enable ingress
    minikube addons enable metrics-server
    
    # Wait for addons to be ready
    Write-Status "Waiting for addons to initialize..."
    Start-Sleep -Seconds 10
    
    Write-Success "Minikube addons enabled"
}

# Build Docker image in Minikube environment
function Build-Image {
    Write-Status "Building Docker image in Minikube environment..."
    
    # Set Docker environment to use Minikube's Docker daemon
    Write-Status "Configuring Docker environment for Minikube..."
    try {
        $envCommand = minikube docker-env --shell powershell
        Invoke-Expression $envCommand
    }
    catch {
        Write-Error "Failed to configure Docker environment: $_"
        exit 1
    }
    
    # Build the image
    Write-Status "Building NestJS application image..."
    docker build -t nestjs-app:latest .\lesson-1\
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker image built successfully"
    } else {
        Write-Error "Failed to build Docker image"
        exit 1
    }
}

# Deploy to Kubernetes
function Deploy-ToKubernetes {
    Write-Status "Deploying to Kubernetes..."
    
    # Apply all manifests
    $manifests = @(
        "namespace.yaml",
        "configmap.yaml", 
        "secrets.yaml",
        "postgres-pv.yaml",
        "postgres-deployment.yaml",
        "redis-deployment.yaml",
        "app-deployment.yaml",
        "ingress.yaml",
        "hpa.yaml"
    )
    
    foreach ($manifest in $manifests) {
        Write-Status "Applying $manifest..."
        kubectl apply -f "lesson-1\k8s\$manifest"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to apply $manifest"
            exit 1
        }
    }
    
    Write-Success "Kubernetes manifests applied"
}

# Wait for deployments to be ready
function Wait-ForDeployments {
    Write-Status "Waiting for deployments to be ready..."
    
    # Wait for PostgreSQL
    Write-Status "Waiting for PostgreSQL deployment..."
    kubectl rollout status deployment/postgres-deployment -n nestjs-app --timeout=300s
    if ($LASTEXITCODE -eq 0) {
        Write-Success "PostgreSQL deployment ready"
    } else {
        Write-Error "PostgreSQL deployment failed"
        exit 1
    }
    
    # Wait for Redis
    Write-Status "Waiting for Redis deployment..."
    kubectl rollout status deployment/redis-deployment -n nestjs-app --timeout=300s
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Redis deployment ready"
    } else {
        Write-Error "Redis deployment failed"
        exit 1
    }
    
    # Wait for main application
    Write-Status "Waiting for NestJS application deployment..."
    kubectl rollout status deployment/nestjs-app-deployment -n nestjs-app --timeout=300s
    if ($LASTEXITCODE -eq 0) {
        Write-Success "NestJS application deployment ready"
    } else {
        Write-Error "NestJS application deployment failed"
        exit 1
    }
}

# Display access information
function Show-AccessInfo {
    Write-Status "Getting access information..."
    
    # Get Minikube IP
    $MINIKUBE_IP = minikube ip
    
    Write-Host ""
    Write-Success "🎉 Deployment completed successfully!"
    Write-Host ""
    Write-Host "📋 Access Information:" -ForegroundColor $Colors.White
    Write-Host "  🌐 Application URL (NodePort): http://$MINIKUBE_IP:30080" -ForegroundColor $Colors.Green
    Write-Host "  📚 API Documentation: http://$MINIKUBE_IP:30080/api" -ForegroundColor $Colors.Green
    Write-Host "  ❤️  Health Check: http://$MINIKUBE_IP:30080/health" -ForegroundColor $Colors.Green
    Write-Host ""
    Write-Host "🔧 Management Commands:" -ForegroundColor $Colors.White
    Write-Host "  📊 View pods: kubectl get pods -n nestjs-app" -ForegroundColor $Colors.Yellow
    Write-Host "  📈 View services: kubectl get services -n nestjs-app" -ForegroundColor $Colors.Yellow
    Write-Host "  🔍 View logs: kubectl logs deployment/nestjs-app-deployment -n nestjs-app" -ForegroundColor $Colors.Yellow
    Write-Host "  📋 View HPA: kubectl get hpa -n nestjs-app" -ForegroundColor $Colors.Yellow
    Write-Host ""
    Write-Host "🧪 Load Testing:" -ForegroundColor $Colors.White
    Write-Host "  🏃 Run load test: `$env:BASE_URL = 'http://$MINIKUBE_IP:30080'; k6 run lesson-1\k6-tests\load-test.js" -ForegroundColor $Colors.Yellow
    Write-Host "  💪 Run stress test: `$env:BASE_URL = 'http://$MINIKUBE_IP:30080'; k6 run lesson-1\k6-tests\stress-test.js" -ForegroundColor $Colors.Yellow
    Write-Host "  ⚡ Run spike test: `$env:BASE_URL = 'http://$MINIKUBE_IP:30080'; k6 run lesson-1\k6-tests\spike-test.js" -ForegroundColor $Colors.Yellow
    Write-Host ""
}

# Cleanup function
function Remove-Deployment {
    Write-Status "Cleaning up..."
    kubectl delete -f lesson-1\k8s\ --ignore-not-found=true
    Write-Success "Cleanup completed"
}

# Show deployment status
function Show-Status {
    Write-Status "Checking deployment status..."
    Write-Host ""
    Write-Host "📊 Pods:" -ForegroundColor $Colors.White
    kubectl get pods -n nestjs-app
    Write-Host ""
    Write-Host "📈 Services:" -ForegroundColor $Colors.White
    kubectl get services -n nestjs-app
    Write-Host ""
    Write-Host "🔄 HPA:" -ForegroundColor $Colors.White
    kubectl get hpa -n nestjs-app
    Write-Host ""
}

# Show logs
function Show-Logs {
    Write-Status "Showing application logs..."
    kubectl logs deployment/nestjs-app-deployment -n nestjs-app -f
}

# Run load test
function Run-LoadTest {
    Write-Status "Running load test..."
    $MINIKUBE_IP = minikube ip
    $env:BASE_URL = "http://$MINIKUBE_IP:30080"
    k6 run lesson-1\k6-tests\load-test.js
}

# Main execution
switch ($Action.ToLower()) {
    "deploy" {
        Test-Prerequisites
        Start-Minikube
        Build-Image
        Deploy-ToKubernetes
        Wait-ForDeployments
        Show-AccessInfo
    }
    "cleanup" {
        Remove-Deployment
    }
    "restart" {
        Remove-Deployment
        Start-Sleep -Seconds 5
        Test-Prerequisites
        Start-Minikube
        Build-Image
        Deploy-ToKubernetes
        Wait-ForDeployments
        Show-AccessInfo
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "test" {
        Run-LoadTest
    }
    default {
        Write-Host "Usage: .\deploy-minikube-fixed.ps1 {deploy|cleanup|restart|status|logs|test}" -ForegroundColor $Colors.White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor $Colors.White
        Write-Host "  deploy  - Deploy the application (default)" -ForegroundColor $Colors.Yellow
        Write-Host "  cleanup - Remove all resources" -ForegroundColor $Colors.Yellow
        Write-Host "  restart - Cleanup and redeploy" -ForegroundColor $Colors.Yellow
        Write-Host "  status  - Show deployment status" -ForegroundColor $Colors.Yellow
        Write-Host "  logs    - Show application logs" -ForegroundColor $Colors.Yellow
        Write-Host "  test    - Run load test" -ForegroundColor $Colors.Yellow
        exit 1
    }
}
