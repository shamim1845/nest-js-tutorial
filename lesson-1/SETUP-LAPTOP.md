# Laptop Deployment Setup Guide

This guide will help you deploy and test your NestJS application on your local laptop using Minikube.

## 📋 Prerequisites

### 1. Install Required Software

#### **Docker Desktop**
```bash
# Download and install Docker Desktop for Windows
# https://www.docker.com/products/docker-desktop/
# Make sure WSL2 backend is enabled
```

#### **Minikube**
```bash
# Install using Chocolatey (recommended)
choco install minikube

# Or download directly from:
# https://minikube.sigs.k8s.io/docs/start/
```

#### **kubectl**
```bash
# Install using Chocolatey
choco install kubernetes-cli

# Or download from:
# https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
```

#### **k6 (for load testing)**
```bash
# Install using Chocolatey
choco install k6

# Or download from:
# https://k6.io/docs/getting-started/installation/
```

#### **Git (if not already installed)**
```bash
# Install using Chocolatey
choco install git

# Or download from:
# https://git-scm.com/download/win
```

### 2. Verify Installation

```bash
# Check all tools are installed
docker --version
minikube version
kubectl version --client
k6 version
```

## 🚀 Quick Deployment

### **Option 1: One-Command Deploy (Recommended)**

```bash
# Navigate to your project directory
cd C:\Users\User\Desktop\nest-js-tutorial

# Run the deployment script
.\lesson-1\deploy-minikube.sh deploy
```

### **Option 2: Step-by-Step Manual Deploy**

#### **Step 1: Start Minikube**
```bash
# Start Minikube with Docker driver
minikube start --driver=docker

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify addons
minikube addons list
```

#### **Step 2: Build Docker Image**
```bash
# Set Docker environment to Minikube
minikube docker-env | Invoke-Expression

# Build the application image
docker build -t nestjs-app:latest .\lesson-1\
```

#### **Step 3: Deploy to Kubernetes**
```bash
# Apply all Kubernetes manifests
kubectl apply -f lesson-1\k8s\namespace.yaml
kubectl apply -f lesson-1\k8s\configmap.yaml
kubectl apply -f lesson-1\k8s\secrets.yaml
kubectl apply -f lesson-1\k8s\postgres-pv.yaml
kubectl apply -f lesson-1\k8s\postgres-deployment.yaml
kubectl apply -f lesson-1\k8s\redis-deployment.yaml
kubectl apply -f lesson-1\k8s\app-deployment.yaml
kubectl apply -f lesson-1\k8s\ingress.yaml
kubectl apply -f lesson-1\k8s\hpa.yaml
```

#### **Step 4: Wait for Deployment**
```bash
# Wait for all deployments to be ready
kubectl rollout status deployment/postgres-deployment -n nestjs-app --timeout=300s
kubectl rollout status deployment/redis-deployment -n nestjs-app --timeout=300s
kubectl rollout status deployment/nestjs-app-deployment -n nestjs-app --timeout=300s
```

#### **Step 5: Get Access URL**
```bash
# Get the application URL
minikube service nestjs-app-nodeport -n nestjs-app --url

# Or get Minikube IP
minikube ip
# Then access: http://<minikube-ip>:30080
```

## 🧪 Load Testing

### **Run Load Tests**

```bash
# Get Minikube IP
$MINIKUBE_IP = minikube ip

# Run load test
$env:BASE_URL = "http://$MINIKUBE_IP:30080"; k6 run lesson-1\k6-tests\load-test.js

# Run stress test
$env:BASE_URL = "http://$MINIKUBE_IP:30080"; k6 run lesson-1\k6-tests\stress-test.js

# Run spike test
$env:BASE_URL = "http://$MINIKUBE_IP:30080"; k6 run lesson-1\k6-tests\spike-test.js
```

### **Using npm scripts (if you have Node.js)**
```bash
cd lesson-1\k6-tests

# Install dependencies (if needed)
npm install

# Run tests with Minikube URL
$env:BASE_URL = "http://$(minikube ip):30080"; npm run test:load
```

## 📊 Monitoring

### **Check Deployment Status**
```bash
# View all resources
kubectl get all -n nestjs-app

# Check pods
kubectl get pods -n nestjs-app

# Check services
kubectl get services -n nestjs-app

# Check auto-scaling
kubectl get hpa -n nestjs-app

# View logs
kubectl logs deployment/nestjs-app-deployment -n nestjs-app -f
```

### **Resource Usage**
```bash
# Check resource usage
kubectl top pods -n nestjs-app

# Check node resources
kubectl top nodes
```

## 🌐 Access Points

Once deployed, you can access:

- **Application**: `http://<minikube-ip>:30080`
- **API Documentation**: `http://<minikube-ip>:30080/api`
- **Health Check**: `http://<minikube-ip>:30080/health`

## 🔧 Management Commands

### **Deployment Script Commands**
```bash
# Deploy application
.\lesson-1\deploy-minikube.sh deploy

# Check status
.\lesson-1\deploy-minikube.sh status

# View logs
.\lesson-1\deploy-minikube.sh logs

# Run load test
.\lesson-1\deploy-minikube.sh test

# Cleanup everything
.\lesson-1\deploy-minikube.sh cleanup

# Restart deployment
.\lesson-1\deploy-minikube.sh restart
```

### **Manual kubectl Commands**
```bash
# Scale application manually
kubectl scale deployment nestjs-app-deployment --replicas=5 -n nestjs-app

# Update application image
kubectl set image deployment/nestjs-app-deployment nestjs-app=nestjs-app:v2 -n nestjs-app

# Port forward for debugging
kubectl port-forward service/nestjs-app-service 8000:80 -n nestjs-app
# Then access: http://localhost:8000
```

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Minikube won't start**
```bash
# Check Docker is running
docker ps

# Try different driver
minikube start --driver=hyperv  # or --driver=virtualbox
```

#### **2. Pods stuck in Pending**
```bash
# Check pod details
kubectl describe pod <pod-name> -n nestjs-app

# Check events
kubectl get events -n nestjs-app --sort-by='.lastTimestamp'
```

#### **3. Application not accessible**
```bash
# Check service endpoints
kubectl get endpoints -n nestjs-app

# Check ingress
kubectl get ingress -n nestjs-app

# Port forward for testing
kubectl port-forward service/nestjs-app-service 8000:80 -n nestjs-app
```

#### **4. Load tests failing**
```bash
# Check application health
curl http://$(minikube ip):30080/health

# Check application logs
kubectl logs deployment/nestjs-app-deployment -n nestjs-app

# Test with smaller load first
$env:BASE_URL = "http://$(minikube ip):30080"; $env:K6_VUS = "5"; k6 run lesson-1\k6-tests\load-test.js
```

## 📈 Performance Tips

### **For Better Performance on Laptop**

1. **Allocate more resources to Minikube**:
```bash
minikube config set memory 4096
minikube config set cpus 4
minikube delete
minikube start --driver=docker
```

2. **Use SSD storage** (if available)

3. **Close unnecessary applications** during load testing

4. **Monitor system resources** during tests

## 🔄 Development Workflow

### **For Development**

1. **Make changes to your code**
2. **Rebuild and redeploy**:
```bash
minikube docker-env | Invoke-Expression
docker build -t nestjs-app:latest .\lesson-1\
kubectl rollout restart deployment/nestjs-app-deployment -n nestjs-app
```

3. **Test changes**:
```bash
.\lesson-1\deploy-minikube.sh test
```

### **For Production-like Testing**

1. **Increase replicas**:
```bash
kubectl scale deployment nestjs-app-deployment --replicas=5 -n nestjs-app
```

2. **Run comprehensive tests**:
```bash
$env:BASE_URL = "http://$(minikube ip):30080"; k6 run lesson-1\k6-tests\stress-test.js
```

## 🎯 Next Steps

1. **Deploy the application** using the commands above
2. **Run load tests** to verify performance
3. **Monitor the application** using kubectl commands
4. **Scale the application** and test auto-scaling behavior
5. **Experiment with different configurations**

Your laptop setup is now ready for full-stack development and testing! 🚀
