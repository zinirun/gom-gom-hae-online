# Build N Run Container

docker_username="heojj97"
container_name="gom-gom-hae-app"
image_name="gom-gom-hae"
version="0.1"
http_port=80
note_port=4000

echo "## Automation docker build and run ##"

# remove container
echo "=> Remove previous container..."
docker rm -f ${container_name}

# remove image
echo "=> Remove previous image..."
docker rmi -f ${docker_username}/${image_name}:${version}

# new-build/re-build docker image
echo "=> Build new image..."
docker build --tag ${docker_username}/${image_name}:${version} .

# Run container connected to existing database container
echo "=> Run container..."
docker run -t -d --name ${container_name} -p ${http_port}:${node_port} -p ${docker_username}/${image_name}:${version}