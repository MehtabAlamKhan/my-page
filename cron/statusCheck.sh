#!/bin/sh

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
    
    # Check if there are changes to be built
    if [ "$(git diff --stat HEAD@{1} HEAD)" ]; then
        log "Changes detected, rebuilding and restarting Docker containers."
        # Run Docker Compose to rebuild and start containers
        if docker-compose up -d --build; then
            log "Docker Compose started successfully."
        else
            log "Failed to run Docker Compose."
            exit 1
        fi
    else
        log "No changes detected, skipping Docker rebuild."
    fi
else
    log "Failed to pull changes from Git."
    exit 1
fi

log "Deployment script completed successfully."
