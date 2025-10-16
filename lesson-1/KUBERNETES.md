# Kubernetes Deployment Guide for NestJS Application

This guide explains how to deploy your NestJS application to Minikube with auto-deploy capabilities and load testing using k6.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   Load Balancer │    │   HPA           │
│   (nginx)       │    │   (Service)     │    │   (Auto-scaling)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS Application Pods                     │
│                    (3 replicas by default)                     │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Redis Cache   │    │   Metrics       │
│   (Persistent)  │    │   (In-Memory)   │    │   Server        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker installed
- Minikube installed
- kubectl configured
- Git repository with GitHub Actions enabled

### 1. Start Minikube

```bash
# Start Minikube with required addons
minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server

# Verify addons are enabled
minikube addons list
```

### 2. Build and Deploy

```bash
# Build Docker image in Minikube environment
eval $(minikube docker-env)
docker build -t nestjs-app:latest ./lesson-1

# Deploy to Kubernetes
kubectl apply -f lesson-1/k8s/

# Wait for deployment
kubectl rollout status deployment/nestjs-app-deployment -n nestjs-app --timeout=300s
```

### 3. Access the Application

```bash
# Get application URL
minikube service nestjs-app-nodeport -n nestjs-app --url

# Or access via Ingress (add to /etc/hosts)
echo "$(minikube ip) nestjs-app.local" | sudo tee -a /etc/hosts
# Then visit: http://nestjs-app.local
```

## 📁 Kubernetes Manifests

### Core Components

| File | Purpose |
|------|---------|
| `namespace.yaml` | Creates dedicated namespace |
| `configmap.yaml` | Application configuration |
| `secrets.yaml` | Sensitive data (DB passwords, JWT secrets) |
| `app-deployment.yaml` | Main application deployment |
| `postgres-deployment.yaml` | Database deployment |
| `redis-deployment.yaml` | Cache deployment |
| `ingress.yaml` | External access configuration |
| `hpa.yaml` | Auto-scaling configuration |

### Services

- **nestjs-app-service**: ClusterIP service for internal communication
- **nestjs-app-nodeport**: NodePort service for external access (port 30080)
- **postgres-service**: PostgreSQL database service
- **redis-service**: Redis cache service

## 🔄 Auto-Deploy with GitHub Actions

### CI/CD Pipeline Features

1. **Build Stage**:
   - Builds Docker image
   - Pushes to GitHub Container Registry
   - Supports multiple tags (branch, SHA, latest)

2. **Deploy Stage**:
   - Starts Minikube cluster
   - Builds and deploys application
   - Runs health checks
   - Provides access URLs

3. **Load Testing Stage**:
   - Runs k6 load tests automatically
   - Generates performance reports
   - Comments on PRs with results

### Triggering Deployments

```bash
# Deploy on main branch push
git push origin main

# Deploy on PR creation
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub
```

### Manual Deployment

```bash
# Trigger workflow manually
gh workflow run deploy.yml
```

## 🧪 Load Testing with k6

### Test Types

1. **Load Test** (`load-test.js`):
   - Normal load testing (10-20 users)
   - Gradual ramp-up and ramp-down
   - Tests all API endpoints

2. **Stress Test** (`stress-test.js`):
   - High load testing (50-200 users)
   - Finds system breaking points
   - Tests database performance

3. **Spike Test** (`spike-test.js`):
   - Sudden load spikes
   - Tests system resilience
   - Recovery verification

### Running Tests Locally

```bash
# Install k6
# macOS: brew install k6
# Linux: sudo apt-get install k6
# Windows: choco install k6

# Run load test
cd lesson-1/k6-tests
npm run test:load-local

# Run stress test
BASE_URL=http://localhost:8000 k6 run stress-test.js

# Run spike test
BASE_URL=http://localhost:8000 k6 run spike-test.js
```

### Running Tests on Minikube

```bash
# Get Minikube IP and run tests
MINIKUBE_IP=$(minikube ip)
BASE_URL=http://$MINIKUBE_IP:30080 k6 run load-test.js
```

### Test Configuration

Tests are configurable via environment variables:

```bash
export K6_DURATION="120s"      # Test duration
export K6_VUS="50"             # Virtual users
export BASE_URL="http://localhost:8000"  # Target URL
```

## 📊 Monitoring and Scaling

### Horizontal Pod Autoscaler (HPA)

- **Min Replicas**: 2
- **Max Replicas**: 10
- **CPU Threshold**: 70%
- **Memory Threshold**: 80%

### Scaling Behavior

```yaml
scaleDown:
  stabilizationWindowSeconds: 300
  policies:
  - type: Percent
    value: 50
    periodSeconds: 60

scaleUp:
  stabilizationWindowSeconds: 60
  policies:
  - type: Percent
    value: 100
    periodSeconds: 30
  - type: Pods
    value: 2
    periodSeconds: 30
```

### Monitoring Commands

```bash
# Check pod status
kubectl get pods -n nestjs-app

# Check HPA status
kubectl get hpa -n nestjs-app

# Check resource usage
kubectl top pods -n nestjs-app

# Check service endpoints
kubectl get endpoints -n nestjs-app
```

## 🔧 Configuration

### Environment Variables

Update `k8s/configmap.yaml` and `k8s/secrets.yaml` for your environment:

```yaml
# configmap.yaml
data:
  NODE_ENV: "production"
  DB_TYPE: "postgres"
  # ... other config

# secrets.yaml
data:
  DB_PASSWORD: <base64-encoded-password>
  JWT_SECRET_KEY: <base64-encoded-secret>
```

### Resource Limits

Adjust resource limits in deployment files:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## 🐛 Troubleshooting

### Common Issues

1. **Pod Stuck in Pending**:
   ```bash
   kubectl describe pod <pod-name> -n nestjs-app
   kubectl get events -n nestjs-app
   ```

2. **Application Not Starting**:
   ```bash
   kubectl logs deployment/nestjs-app-deployment -n nestjs-app
   kubectl describe deployment nestjs-app-deployment -n nestjs-app
   ```

3. **Database Connection Issues**:
   ```bash
   kubectl logs deployment/postgres-deployment -n nestjs-app
   kubectl get services -n nestjs-app
   ```

4. **Ingress Not Working**:
   ```bash
   kubectl get ingress -n nestjs-app
   kubectl describe ingress nestjs-ingress -n nestjs-app
   ```

### Debug Commands

```bash
# Get all resources
kubectl get all -n nestjs-app

# Check configuration
kubectl describe configmap nestjs-config -n nestjs-app
kubectl describe secret nestjs-secrets -n nestjs-app

# Port forward for debugging
kubectl port-forward service/nestjs-app-service 8000:80 -n nestjs-app
```

## 🔒 Security Considerations

### Production Security

1. **Update Secrets**:
   ```bash
   # Generate secure passwords
   openssl rand -base64 32
   
   # Update secrets
   kubectl create secret generic nestjs-secrets \
     --from-literal=DB_PASSWORD=<secure-password> \
     --from-literal=JWT_SECRET_KEY=<secure-secret> \
     -n nestjs-app --dry-run=client -o yaml | kubectl apply -f -
   ```

2. **Enable TLS**:
   - Install cert-manager
   - Configure TLS certificates
   - Update ingress with TLS

3. **Network Policies**:
   - Implement network segmentation
   - Restrict pod-to-pod communication

## 📈 Performance Optimization

### Database Optimization

1. **Connection Pooling**:
   ```yaml
   env:
   - name: DB_POOL_SIZE
     value: "20"
   - name: DB_POOL_ACQUIRE_TIMEOUT
     value: "60000"
   ```

2. **Redis Configuration**:
   ```yaml
   - name: REDIS_PASSWORD
     valueFrom:
       secretKeyRef:
         name: redis-secret
         key: password
   ```

### Application Optimization

1. **Enable Compression**:
   ```yaml
   - name: ENABLE_COMPRESSION
     value: "true"
   ```

2. **Configure Logging**:
   ```yaml
   - name: LOG_LEVEL
     value: "warn"
   ```

## 🚀 Production Deployment

### Prerequisites

- Kubernetes cluster (GKE, EKS, AKS)
- Container registry access
- SSL certificates
- Monitoring stack (Prometheus, Grafana)

### Steps

1. **Update Image References**:
   ```yaml
   image: your-registry.com/nestjs-app:latest
   imagePullPolicy: Always
   ```

2. **Configure Ingress**:
   - Update hostnames
   - Enable TLS
   - Configure load balancer

3. **Set Resource Limits**:
   - Adjust based on load testing results
   - Configure HPA thresholds

4. **Enable Monitoring**:
   - Deploy Prometheus operator
   - Configure Grafana dashboards
   - Set up alerting

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [k6 Documentation](https://k6.io/docs/)
- [NestJS Deployment Guide](https://docs.nestjs.com/recipes/deployment)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
