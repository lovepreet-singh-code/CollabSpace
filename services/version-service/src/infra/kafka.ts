import { Kafka, Consumer } from "kafkajs";
import axios from "axios";
import { config } from "../config";
import { VersionModel } from "../models/version.model";

let consumer: Consumer | null = null;

export const initKafkaConsumer = async () => {
    if (config.kafkaBrokers.length === 0) {
        console.log("No Kafka brokers configured, skipping Kafka init");
        return;
    }

    const kafka = new Kafka({
        clientId: config.kafkaClientId,
        brokers: config.kafkaBrokers,
    });

    consumer = kafka.consumer({ groupId: "version-service-group" });

    let retries = 5;
    while (retries > 0) {
        try {
            await consumer.connect();
            console.log("Connected to Kafka Consumer");
            break;
        } catch (error) {
            console.error(`Error connecting to Kafka, retries left: ${retries}`, error);
            retries -= 1;
            if (retries === 0) {
                console.error("Failed to connect to Kafka after multiple attempts");
                process.exit(1);
            }
            await new Promise((res) => setTimeout(res, 5000));
        }
    }

    await consumer.subscribe({ topic: "document.saved", fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (topic === "document.saved") {
                const value = message.value?.toString();
                if (value) {
                    try {
                        const { docName } = JSON.parse(value);
                        await handleDocumentSaved(docName);
                    } catch (err) {
                        console.error("Error processing message:", err);
                    }
                }
            }
        },
    });
};

const handleDocumentSaved = async (docName: string) => {
    console.log(`Processing save for document: ${docName}`);
    try {
        // Fetch current state from collaboration-service
        const response = await axios.get(`${config.collaborationServiceUrl}/internal/documents/${docName}/state`, {
            responseType: "arraybuffer",
        });

        const content = Buffer.from(response.data);

        // Determine next version number
        const count = await VersionModel.countDocuments({ docName });
        const versionNumber = count + 1;

        // Create new version
        const version = new VersionModel({
            docName,
            versionNumber,
            content,
        });

        await version.save();
        console.log(`Saved version ${versionNumber} for document ${docName}`);
    } catch (err) {
        console.error(`Failed to create version for ${docName}:`, err);
    }
};
