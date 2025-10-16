# Clean NestJS Deployment Script for Minikube
param(
    [Parameter(Position=0)]
    [string]$Action = "deploy"
)

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Start-Minikube {
    Write-Status "Starting Minikube..."
    
    $status = minikube status 2>$null
    if ($status -match "Running") {
        Write-Host "Minikube is already running" -ForegroundColor Yellow
    } else {
        Write-Status "Starting Minikube with Docker driver..."
        minikube start --driver=docker
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to start Minikube"
            exit 1
        }
        Write-Success "Minikube started successfully"
    }
    
    Write-Status "Enabling addons..."
    minikube addons enable ingress
    minikube addons enable metrics-server
    Start-Sleep -Seconds 5
    Write-Success "Addons enabled"
}

function Build-Image {
    Write-Status "Building Docker image..."
    
    $envCommand = minikube docker-env --shell powershell
    Invoke-Expression $envCommand
    
    docker build -t nestjs-app:latest .\lesson-1\
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker image built successfully"
    } else {
        Write-Error "Failed to build Docker image"
        exit 1
    }
}

function Deploy-App {
    Write-Status "Deploying to Kubernetes..."
    
    kubectl apply -f lesson-1\k8s\namespace.yaml
    kubectl apply -f lesson-1\k8s\configmap.yaml
    kubectl apply -f lesson-1\k8s\secrets.yaml
    kubectl apply -f lesson-1\k8s\postgres-pv.yaml
    kubectl apply -f lesson-1\k8s\postgres-deployment.yaml
    kubectl apply -f lesson-1\k8s\redis-deployment.yaml
    kubectl apply -f lesson-1\k8s\app-deployment.yaml
    kubectl apply -f lesson-1\k8s\ingress.yaml
    kubectl apply -f lesson-1\k8s\hpa.yaml
    
    Write-Success "Kubernetes manifests applied"
}

function Wait-ForReady {
    Write-Status "Waiting for deployments to be ready..."
    
    Write-Status "Waiting for PostgreSQL..."
    kubectl rollout status deployment/postgres-deployment -n nestjs-app --timeout=300s
    
    Write-Status "Waiting for Redis..."
    kubectl rollout status deployment/redis-deployment -n nestjs-app --timeout=300s
    
    Write-Status "Waiting for NestJS app..."
    kubectl rollout status deployment/nestjs-app-deployment -n nestjs-app --timeout=300s
    
    Write-Success "All deployments are ready"
}

function Show-Info {
    Write-Status "Getting access information..."
    $MINIKUBE_IP = minikube ip
    
    Write-Host ""
    Write-Success "Deployment completed successfully!"
    Write-Host ""
    Write-Host "Access Information:" -ForegroundColor White
    Write-Host "  Application URL: http://$MINIKUBE_IP:30080" -ForegroundColor Green
    Write-Host "  API Docs: http://$MINIKUBE_IP:30080/api" -ForegroundColor Green
    Write-Host "  Health Check: http://$MINIKUBE_IP:30080/health" -ForegroundColor Green
    Write-Host ""
}

function Show-Status {
    Write-Status "Deployment Status:"
    Write-Host ""
    kubectl get pods -n nestjs-app
    Write-Host ""
    kubectl get services -n nestjs-app
}

function Run-Test {
    Write-Status "Running load test..."
    $MINIKUBE_IP = minikube ip
    $env:BASE_URL = "http://$MINIKUBE_IP:30080"
    k6 run lesson-1\k6-tests\load-test.js
}

function Cleanup {
    Write-Status "Cleaning up..."
    kubectl delete -f lesson-1\k8s\ --ignore-not-found=true
    Write-Success "Cleanup completed"
}

switch ($Action.ToLower()) {
    "deploy" {
        Start-Minikube
        Build-Image
        Deploy-App
        Wait-ForReady
        Show-Info
    }
    "status" {
        Show-Status
    }
    "test" {
        Run-Test
    }
    "cleanup" {
        Cleanup
    }
    default {
        Write-Host "Usage: deploy-clean.ps1 {deploy|status|test|cleanup}" -ForegroundColor White
    }
}
