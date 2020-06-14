import * as HTTP from "http";
import { v4 as UUID } from "uuid";
import { Kafka, EachMessagePayload, Consumer } from "kafkajs";

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

class GenericConsumer {
  private consumer: Consumer;

  public constructor(private topic: string, kafka: Kafka) {
    this.consumer = kafka.consumer({ groupId: UUID() });
  }

  public async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic });
  }

  public async stop(): Promise<void> {
    await this.consumer.disconnect();
  }

  public async onMessage<T>(fn: (message: T) => void): Promise<void> {
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const message = JSON.parse(payload.message.value.toString("utf-8"));
          fn(message);
        } catch (error) {
          console.error("onMessage:", error);
        }
      },
    });
  }
}

function createHttpHandler(consumer: GenericConsumer): HTTP.RequestListener {
  return async function (request, response) {
    await consumer.start();

    request.on("close", () => {
      void consumer.stop();
      response.end();
    });

    response.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Request-Method": "*",
      "Access-Control-Allow-Methods": "OPTIONS, GET",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    await consumer.onMessage<Message>((message) => {
      console.debug("%s: onMessage triggered", new Date(), { message });
      const event = createSseEvent(message);
      response.write(`id: ${event.id}\n`);
      response.write(`event: ${event.event}\n`);
      response.write(`data: ${event.data}\n\n`);
    });
  };
}

async function main() {
  const port = process.env.PORT!;
  const broker = process.env.KAFKA_BROKER_URL!;
  const topic = process.env.KAFKA_TOPIC_NAME!;

  const kafka = new Kafka({
    brokers: [broker],
  });

  const consumer = new GenericConsumer(topic, kafka);

  const server = HTTP.createServer(createHttpHandler(consumer));

  server
    .listen(port)
    .once("listening", () => console.debug("Server running on port %d", port));
}

main().catch(console.error);
