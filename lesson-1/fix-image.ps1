# Quick fix for Docker image issue
Write-Host "Setting Docker environment to Minikube..." -ForegroundColor Cyan

# Set Docker environment to Minikube
Write-Host "Setting Docker environment variables..." -ForegroundColor Cyan
$env:DOCKER_TLS_VERIFY = "1"
$env:DOCKER_HOST = "tcp://127.0.0.1:2376"
$env:DOCKER_CERT_PATH = "$env:USERPROFILE\.minikube\certs"
$env:MINIKUBE_ACTIVE_DOCKERD = "minikube"

Write-Host "Rebuilding Docker image in Minikube environment..." -ForegroundColor Cyan
docker build -t nestjs-app:latest .\lesson-1\

Write-Host "Verifying image exists..." -ForegroundColor Cyan
docker images | Select-String "nestjs-app"

Write-Host "Restarting deployment..." -ForegroundColor Cyan
kubectl rollout restart deployment/nestjs-app-deployment -n nestjs-app

Write-Host "Waiting for rollout to complete..." -ForegroundColor Cyan
kubectl rollout status deployment/nestjs-app-deployment -n nestjs-app --timeout=300s

Write-Host "Checking pod status..." -ForegroundColor Cyan
kubectl get pods -n nestjs-app

Write-Host "Getting access URL..." -ForegroundColor Cyan
$MINIKUBE_IP = minikube ip
Write-Host "Application URL: http://$MINIKUBE_IP:30080" -ForegroundColor Green
