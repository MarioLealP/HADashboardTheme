#!/usr/bin/env bash
# ==============================================================================
# AlmaLinux Jenkins + Node.js + Nginx Setup Script
# For Endfield Dashboard CI/CD and Web Hosting
# ==============================================================================

set -e

echo "=== 1. Updating AlmaLinux packages ==="
sudo dnf update -y

echo "=== 2. Installing Java 17 OpenJDK, Git, and Nginx ==="
sudo dnf install -y java-17-openjdk java-17-openjdk-devel git curl nginx wget

echo "=== 3. Installing Node.js 20 LTS ==="
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

echo "=== 4. Installing Jenkins ==="
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo dnf install -y jenkins

echo "=== 5. Enabling and starting services ==="
sudo systemctl daemon-reload
sudo systemctl enable --now jenkins
sudo systemctl enable --now nginx

echo "=== 6. Configuring Firewall for HTTP (80), HTTPS (443), and Jenkins (8080) ==="
if systemctl is-active --quiet firewalld; then
    sudo firewall-cmd --permanent --add-port=8080/tcp
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
fi

echo "=== 7. Creating web root directory for Endfield Dashboard ==="
sudo mkdir -p /var/www/endfield-dashboard
sudo chown -R nginx:nginx /var/www/endfield-dashboard
sudo chmod -R 755 /var/www/endfield-dashboard

echo "=============================================================================="
echo "SUCCESS! Jenkins, Node.js, and Nginx installed."
echo "Jenkins URL: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "Initial Jenkins Admin Password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword || echo "(Wait a few seconds for Jenkins to generate /var/lib/jenkins/secrets/initialAdminPassword)"
echo "=============================================================================="
