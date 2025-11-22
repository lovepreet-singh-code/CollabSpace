import { Kafka, Producer } from "kafkajs";
import { config } from "../config";

let producer: Producer | null = null;

export const initKafka = async () => {
    if (config.kafkaBrokers.length === 0) {
        console.log("No Kafka brokers configured, skipping Kafka init");
        return;
    }

    const kafka = new Kafka({
        clientId: config.kafkaClientId,
        brokers: config.kafkaBrokers,
    });

    producer = kafka.producer();
    await producer.connect();
    console.log("Connected to Kafka");
};

export const sendTopic = async (topic: string, message: any) => {
    if (!producer) return;
    await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
    });
};
