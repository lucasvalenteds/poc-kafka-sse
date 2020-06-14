KAFKA_BROKER_URL = "localhost:9092"
KAFKA_TOPIC_NAME = "test"

CONSUMER_PORT ?= 8082

infra-up:
	@docker-compose up --detach

infra-down:
	@docker-compose rm --stop --force

infra-logs:
	@docker-compose logs --follow

install:
	@npm --prefix ./producer install
	@npm --prefix ./consumer install
	@npm --prefix ./client install

run-producer:
	@KAFKA_BROKER_URL=$(KAFKA_BROKER_URL) KAFKA_TOPIC_NAME=$(KAFKA_TOPIC_NAME) \
			npm --prefix ./producer start

run-consumer:
	@PORT=$(CONSUMER_PORT) KAFKA_BROKER_URL=$(KAFKA_BROKER_URL) KAFKA_TOPIC_NAME=$(KAFKA_TOPIC_NAME) \
			npm --prefix ./consumer start

run-client:
	@REACT_APP_CONSUMER_URL=http://localhost:$(CONSUMER_PORT) \
			npm --prefix ./client start
