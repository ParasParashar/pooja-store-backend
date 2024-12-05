import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: "AKIAWCKVMFEYZK633FMV",
    secretAccessKey: "jYzhjQ3ymHJzoGEZQFoH1whUUGkRwg/yaUyiNkkX",
  },
});
const sendOTP = async (phoneNumber, otp) => {
  const message = `Your verification code is ${otp}`;
  try {
    const params = {
      Message: message,
      PhoneNumber: `${phoneNumber}`,
    };

    const command = new PublishCommand(params);
    const response = await snsClient.send(command);
    console.log("OTP Sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

// Example usage
sendOTP("", "123456").then(() => {
  console.log("OTP sent successfully.");
});
``;
