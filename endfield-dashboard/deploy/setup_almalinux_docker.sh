#!/usr/bin/env bash
# ==============================================================================
# AlmaLinux Docker Setup: Jenkins + Registry + App (with Watchtower Auto-Update)
# ==============================================================================

set -e

echo "=== 1. Updating AlmaLinux and installing Docker ==="
sudo dnf update -y
sudo dnf install -y dnf-plugins-core git
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "=== 2. Enabling and starting Docker service ==="
sudo systemctl enable --now docker

echo "=== 3. Opening Firewall ports (8081 Web, 8098 Jenkins, 5000 Registry) ==="
if systemctl is-active --quiet firewalld; then
    sudo firewall-cmd --permanent --add-port=8081/tcp
    sudo firewall-cmd --permanent --add-port=8098/tcp
    sudo firewall-cmd --permanent --add-port=5000/tcp
    sudo firewall-cmd --reload
fi

echo "=== 4. Starting Docker Artifact Registry (Port 5000) ==="
cd "$(dirname "$0")/registry"
sudo docker compose up -d

echo "=== 5. Starting Jenkins CI/CD (Port 8098) ==="
cd "../jenkins"
sudo docker compose up -d --build

echo "=== 6. Starting Endfield Dashboard App + Watchtower Auto-Updater (Port 8081) ==="
cd "../app"
# Note: App container will fail to start until first build is pushed to registry, Watchtower will auto-start it once image exists
sudo docker compose up -d || true

echo "=============================================================================="
echo "SUCCESS! Docker CI/CD Stack Running (Compatible with Cosmos Cloud)."
echo "Jenkins URL:  http://$(hostname -I | awk '{print $1}'):8098"
echo "Registry URL: http://$(hostname -I | awk '{print $1}'):5000"
echo "Web App URL:  http://$(hostname -I | awk '{print $1}'):8081"
echo ""
echo "In Cosmos Cloud UI: Create a Proxy Route pointing to target port 8081."
echo ""
echo "To get initial Jenkins Admin Password, run:"
echo "sudo docker exec endfield-jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
echo "=============================================================================="
