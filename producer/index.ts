import Faker from "faker";
import { v4 as UUID } from "uuid";
import { Kafka } from "kafkajs";

type Message = {
  id: string;
  title: string;
  content: string;
  timestamp: string;
};

function* createMessage(): Generator<Message> {
  while (true) {
    yield {
      id: UUID(),
      title: `${Faker.name.firstName()} ${Faker.name.lastName()}`,
      content: Faker.lorem.sentence(),
      timestamp: Faker.date.recent().toLocaleString(),
    };
  }
}

async function wait(timeInMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInMs);
  });
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

    const producer = kafka.producer();

    await producer.connect();

    for await (const message of createMessage()) {
      const metadata = await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });

      console.debug("%s: Message sent", new Date(), { message, metadata });
      await wait(1000);
    }
  } catch (error) {
    console.error(error);
  }
}

main();
