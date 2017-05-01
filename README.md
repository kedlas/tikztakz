docker build -t connect5image .

docker rm -f connect5

docker run -d -p 8080:8080 -v `pwd`:/app --name connect5 connect5image