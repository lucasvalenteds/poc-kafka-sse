package poc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.lambdas.Throwing;
import com.github.javafaker.Faker;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;

import java.text.DateFormat;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

public class Main {

    private static final String KAFKA_BROKER_URL = System.getenv("KAFKA_BROKER_URL");
    private static final String KAFKA_TOPIC_NAME = System.getenv("KAFKA_TOPIC_NAME");

    private static Stream<Message> createMessage(Faker faker) {
        return Stream.generate(() -> new Message(
                UUID.randomUUID().toString(),
                String.format("%s %s", faker.name().firstName(), faker.name().lastName()),
                faker.lorem().sentence(),
                DateFormat.getInstance().format(faker.date().past(1, TimeUnit.DAYS))
        ));
    }

    public static void main(String[] args) {
        Properties props = new Properties();
        props.setProperty("bootstrap.servers", KAFKA_BROKER_URL);
        props.setProperty("acks", "all");
        props.setProperty("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        props.setProperty("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

        KafkaProducer<String, String> producer = new KafkaProducer<>(props);

        Runtime.getRuntime().addShutdownHook(new Thread(producer::close));

        Faker faker = Faker.instance();
        ObjectMapper objectMapper = new ObjectMapper();

        createMessage(faker)
                .map(Throwing.function(objectMapper::writeValueAsString))
                .forEach(Throwing.consumer(message -> {
                    producer.send(new ProducerRecord<>(KAFKA_TOPIC_NAME, message)).get();
                    System.out.println(String.format("Message sent: %s", message));
                    Thread.sleep(1000);
                }));
    }
}
