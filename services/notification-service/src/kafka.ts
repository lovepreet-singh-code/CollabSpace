import { Kafka, Consumer } from "kafkajs";
import config from "./config";
import { logger } from "./utils/logger";
import { handleEvent } from "./services/notify.service";

const kafka = new Kafka({
    clientId: config.kafka.clientId,
    brokers: config.kafka.brokers,
    retry: {
        initialRetryTime: 100,
        retries: 8,
    },
});

let consumer: Consumer;

export async function startKafkaConsumer() {
    try {
        consumer = kafka.consumer({ groupId: config.kafka.groupId });
        await consumer.connect();
        logger.info("Connected to Kafka");

        const topics = [
            "document.saved",
            "document.restored",
            "document.shared",
            "comment.added",
            "collaborator.added",
        ];

        await consumer.subscribe({ topics, fromBeginning: false });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const value = message.value?.toString();
                    if (!value) return;
                    const payload = JSON.parse(value);
                    logger.info(`Received event: ${topic}`, { topic, payload });
                    await handleEvent(topic, payload);
                } catch (err) {
                    logger.error(`Error processing Kafka message on topic ${topic}`, err);
                    // Don't crash the consumer
                }
            },
        });
    } catch (err) {
        logger.error("Failed to start Kafka consumer", err);
        // Retry connection logic could go here, but for now we log and exit or keep running
    }
}

export async function shutdownKafka() {
    if (consumer) {
        await consumer.disconnect();
        logger.info("Kafka consumer disconnected");
    }
}
