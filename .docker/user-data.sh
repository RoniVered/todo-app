#!/bin/bash
dnf install -y docker
systemctl enable --now docker
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 445617516130.dkr.ecr.us-east-1.amazonaws.com
docker pull 445617516130.dkr.ecr.us-east-1.amazonaws.com/todo-app:latest
docker run -d -p 3000:3000 --restart unless-stopped --name todo-app 445617516130.dkr.ecr.us-east-1.amazonaws.com/todo-app:latest
