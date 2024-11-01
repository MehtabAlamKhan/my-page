#!/bin/bash

# Define your project directory
PROJECT_DIR="/home/jason5/my-page"

# Function to log messages
log() {
    echo "$(date +"%Y-%m-%d %H:%M:%S") - $1"
}

# Change to the project directory
cd "$PROJECT_DIR" || { log "Failed to change directory to $PROJECT_DIR"; exit 1; }

# Pull the latest changes from the repository
if git pull origin master; then
    log "Successfully pulled changes from Git."
else
    log "Failed to pull changes from Git."
    exit 1
fi

# Cleanup Docker resources
log "Cleaning up old Docker containers, images, and volumes..."
if docker container prune -f; then
    log "Stopped containers removed."
else
    log "Failed to remove stopped containers."
    exit 1
fi

if docker image prune -f; then
    log "Unused images removed."
else
    log "Failed to remove unused images."
    exit 1
fi

if docker volume prune -f; then
    log "Unused volumes removed."
else
    log "Failed to remove unused volumes."
    exit 1
fi

# Run Docker Compose to rebuild and start containers
if docker-compose up -d --build; then
    log "Docker Compose started successfully."
else
    log "Failed to run Docker Compose."
    exit 1
fi

log "Deployment completed successfully."
