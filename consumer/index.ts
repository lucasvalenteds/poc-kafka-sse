import { Kafka, EachMessagePayload } from "kafkajs";

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

    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const message = payload.message.value.toString("utf-8");

        console.debug("%s: Message received", new Date(), JSON.parse(message));
      },
    });
  } catch (error) {
    console.error(error);
  }
}

main();
