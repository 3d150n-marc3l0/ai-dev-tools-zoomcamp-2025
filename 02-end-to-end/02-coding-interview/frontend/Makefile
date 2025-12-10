IMAGE_NAME = code-connect-frontend
PORT = 8080

.PHONY: build run stop

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d -p $(PORT):80 --name $(IMAGE_NAME) $(IMAGE_NAME)

stop:
	docker stop $(IMAGE_NAME) || true
	docker rm $(IMAGE_NAME) || true
