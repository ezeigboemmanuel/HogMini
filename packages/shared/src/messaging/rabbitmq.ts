import amqp, { Channel, ChannelModel } from "amqplib";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export const connectRabbitMQ = async (
  url: string,
  retries = 5,
  delay = 1000,
): Promise<Channel> => {
  let currentDelay = delay;

  for (let i = 0; i < retries; i++) {
    try {
      if (!connection) {
        connection = await amqp.connect(url);
      }
      if (!channel) {
        channel = await connection.createChannel();
      }

      if (!channel) {
        throw new Error("RabbitMQ channel was not created");
      }

      console.log("Successfully connected to RabbitMQ");
      return channel;
    } catch (error) {
      connection = null;
      channel = null;

      console.error(
        `RabbitMQ connection failed. Retrying in ${currentDelay}ms... (Attempt ${i + 1}/${retries})`,
      );
      if (i === retries - 1) throw new Error("RabbitMQ connection exhausted");
      // Exponential backoff: Wait, then multiply the delay for the next attempt
      await new Promise((res) => setTimeout(res, currentDelay));
      currentDelay *= 2;
    }
  }
  throw new Error("Failed to connect to RabbitMQ");
};
