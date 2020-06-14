# POC: Kafka and SSE

It demonstrates how to produce and consume [Kafka](https://github.com/apache/kafka) events and expose them using [Server-Sent Events](https://en.wikipedia.org/wiki/Server-sent_events) (SSE).

We want to have a producer sending messages to a topic to be read by a consumer and then expose them to a Web application.

## How to run

### Infrastructure

| Description | Command |
| :--- | :--- |
| Provision | `make infra-up` |
| Destroy | `make infra-down` |
| Show logs | `make infra-logs` |

### Services

| Description | Command |
| :--- | :--- |
| Install dependencies | `make install` |
| Run producer | `make run-producer` |
| Run consumer | `make run-consumer` |
| Run client | `make run-client` |
