import * as HTTP from "http";
import { v4 as UUID } from "uuid";
import { Kafka, EachMessagePayload } from "kafkajs";

type Message = {
  id: string;
  title: string;
  content: string;
  timestamp: string;
};

type SseEvent<T> = {
  id: string;
  event: string;
  data: T;
};

function createSseEvent(message: Message): SseEvent<string> {
  return {
    id: UUID(),
    event: "new-message",
    data: JSON.stringify(message),
  };
}

async function main() {
  try {
    const [broker, topic] = [
      process.env.KAFKA_BROKER_URL!,
      process.env.KAFKA_TOPIC_NAME!,
    ];

    const kafka = new Kafka({
      brokers: [broker],
    });

    const consumer = kafka.consumer({ groupId: topic });

    const port = process.env.PORT;
    const server = HTTP.createServer(async (request, response) => {
      response.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      await consumer.subscribe({ topic: topic });

      await consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const message: Message = JSON.parse(
            payload.message.value.toString("utf-8")
          );

          const event = createSseEvent(message);

          response.write(`id: ${event.id}\n`);
          response.write(`event: ${event.event}\n`);
          response.write(`data: ${event.data}\n\n`);
        },
      });

      request.on("close", async () => {
        await consumer.disconnect();
        response.end();
      });
    });

    server
      .listen(port)
      .once("listening", () =>
        console.debug("Server running on port %d", port)
      );
  } catch (error) {
    console.error(error);
  }
}

main();
