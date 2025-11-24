import { Kafka, Producer } from "kafkajs";
import config from "./config";
import { logger } from "./utils/logger";

const kafka = new Kafka({
    clientId: config.kafka.clientId,
    brokers: config.kafka.brokers,
});

let producer: Producer;

export async function connectKafka() {
    try {
        producer = kafka.producer();
        await producer.connect();
        logger.info("Connected to Kafka Producer");
    } catch (err) {
        logger.error("Failed to connect to Kafka", err);
    }
}

export async function publishEvent(topic: string, message: any) {
    if (!producer) {
        logger.error("Kafka producer is not connected");
        return;
    }
    try {
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        logger.info(`Published event to ${topic}`, message);
    } catch (err) {
        logger.error(`Failed to publish event to ${topic}`, err);
    }
}
