#!/bin/bash

# NestJS Application Deployment Script for Minikube
# This script sets up the complete Kubernetes environment

set -e

echo "🚀 Starting NestJS Application Deployment to Minikube"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v minikube &> /dev/null; then
        print_error "Minikube is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Start Minikube with required addons
start_minikube() {
    print_status "Starting Minikube..."
    
    # Check if Minikube is already running
    if minikube status | grep -q "Running"; then
        print_warning "Minikube is already running"
    else
        minikube start --driver=docker
        print_success "Minikube started successfully"
    fi
    
    # Enable required addons
    print_status "Enabling Minikube addons..."
    minikube addons enable ingress
    minikube addons enable metrics-server
    
    # Wait for addons to be ready
    sleep 10
    
    print_success "Minikube addons enabled"
}

# Build Docker image in Minikube environment
build_image() {
    print_status "Building Docker image in Minikube environment..."
    
    # Set Docker environment to use Minikube's Docker daemon
    eval $(minikube docker-env)
    
    # Build the image
    docker build -t nestjs-app:latest ./lesson-1
    
    print_success "Docker image built successfully"
}

# Deploy to Kubernetes
deploy_to_kubernetes() {
    print_status "Deploying to Kubernetes..."
    
    # Apply all manifests
    kubectl apply -f lesson-1/k8s/namespace.yaml
    kubectl apply -f lesson-1/k8s/configmap.yaml
    kubectl apply -f lesson-1/k8s/secrets.yaml
    kubectl apply -f lesson-1/k8s/postgres-pv.yaml
    kubectl apply -f lesson-1/k8s/postgres-deployment.yaml
    kubectl apply -f lesson-1/k8s/redis-deployment.yaml
    kubectl apply -f lesson-1/k8s/app-deployment.yaml
    kubectl apply -f lesson-1/k8s/ingress.yaml
    kubectl apply -f lesson-1/k8s/hpa.yaml
    
    print_success "Kubernetes manifests applied"
}

# Wait for deployments to be ready
wait_for_deployments() {
    print_status "Waiting for deployments to be ready..."
    
    # Wait for PostgreSQL
    kubectl rollout status deployment/postgres-deployment -n nestjs-app --timeout=300s
    print_success "PostgreSQL deployment ready"
    
    # Wait for Redis
    kubectl rollout status deployment/redis-deployment -n nestjs-app --timeout=300s
    print_success "Redis deployment ready"
    
    # Wait for main application
    kubectl rollout status deployment/nestjs-app-deployment -n nestjs-app --timeout=300s
    print_success "NestJS application deployment ready"
}

# Display access information
show_access_info() {
    print_status "Getting access information..."
    
    # Get Minikube IP
    MINIKUBE_IP=$(minikube ip)
    
    # Get NodePort URL
    NODEPORT_URL=$(minikube service nestjs-app-nodeport -n nestjs-app --url)
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Access Information:"
    echo "  🌐 Application URL (NodePort): $NODEPORT_URL"
    echo "  🌐 Application URL (Direct): http://$MINIKUBE_IP:30080"
    echo "  📚 API Documentation: http://$MINIKUBE_IP:30080/api"
    echo "  ❤️  Health Check: http://$MINIKUBE_IP:30080/health"
    echo ""
    echo "🔧 Management Commands:"
    echo "  📊 View pods: kubectl get pods -n nestjs-app"
    echo "  📈 View services: kubectl get services -n nestjs-app"
    echo "  🔍 View logs: kubectl logs deployment/nestjs-app-deployment -n nestjs-app"
    echo "  📋 View HPA: kubectl get hpa -n nestjs-app"
    echo ""
    echo "🧪 Load Testing:"
    echo "  🏃 Run load test: BASE_URL=http://$MINIKUBE_IP:30080 k6 run lesson-1/k6-tests/load-test.js"
    echo "  💪 Run stress test: BASE_URL=http://$MINIKUBE_IP:30080 k6 run lesson-1/k6-tests/stress-test.js"
    echo "  ⚡ Run spike test: BASE_URL=http://$MINIKUBE_IP:30080 k6 run lesson-1/k6-tests/spike-test.js"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    kubectl delete -f lesson-1/k8s/ --ignore-not-found=true
    print_success "Cleanup completed"
}

# Main execution
main() {
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            start_minikube
            build_image
            deploy_to_kubernetes
            wait_for_deployments
            show_access_info
            ;;
        "cleanup")
            cleanup
            ;;
        "restart")
            cleanup
            sleep 5
            main deploy
            ;;
        "status")
            print_status "Checking deployment status..."
            kubectl get all -n nestjs-app
            kubectl get hpa -n nestjs-app
            ;;
        "logs")
            kubectl logs deployment/nestjs-app-deployment -n nestjs-app -f
            ;;
        "test")
            MINIKUBE_IP=$(minikube ip)
            print_status "Running load test..."
            BASE_URL=http://$MINIKUBE_IP:30080 k6 run lesson-1/k6-tests/load-test.js
            ;;
        *)
            echo "Usage: $0 {deploy|cleanup|restart|status|logs|test}"
            echo ""
            echo "Commands:"
            echo "  deploy  - Deploy the application (default)"
            echo "  cleanup - Remove all resources"
            echo "  restart - Cleanup and redeploy"
            echo "  status  - Show deployment status"
            echo "  logs    - Show application logs"
            echo "  test    - Run load test"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
