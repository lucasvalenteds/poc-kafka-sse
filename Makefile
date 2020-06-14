KAFKA_BROKER_URL = "localhost:9092"
KAFKA_TOPIC_NAME = "test"

CONSUMER_PORT ?= 8082

infra-up:
	@docker-compose up --detach

infra-down:
	@docker-compose rm --stop --force

infra-logs:
	@docker-compose logs --follow

run-producer:
	@cd producer && ./gradlew run

run-consumer:
	@npm --prefix ./consumer install
	@PORT=$(CONSUMER_PORT) KAFKA_BROKER_URL=$(KAFKA_BROKER_URL) KAFKA_TOPIC_NAME=$(KAFKA_TOPIC_NAME) \
			npm --prefix ./consumer start

run-client:
	@npm --prefix ./client install
	@REACT_APP_CONSUMER_URL=http://localhost:$(CONSUMER_PORT) \
			npm --prefix ./client start
