import ActionableChatbot from ".";

async function test() {
  const chat = new ActionableChatbot(
    "",
    ""
  );

  chat.addAction({
    name: "balance",
    description:
      "The balance action will tell the user their current balance, and should be executed when the user requests their balance.",
    params: [],
    function: async (params: Record<string, string>) => {
      console.log("Balance Action Executed: ", params);
      return "Current balance is 100.00";
    },
    exampleParams: {},
    exampleUserInput: "What is my balance?",
  });

  chat.addAction({
    name: "transfer",
    description:
      "The transfer action will transfer the users funds to a recipient, the user should always supply the phone number or solana address to transfer to and the amount before this is executed. If the user does not supply this info communicate with the chat action.",
    params: [
      {
        type: "string",
        name: "to",
        description:
          "This is the phone number of the recipient for a transfer. The phone number should be in msisdn format, with the country code, no spaces or dashes, or a valid Solana address, you should convert a phone number to msisdn format automatically for the user.",
        pattern: "^[1-9]{1}[0-9]{10,14}$|^[1-9A-HJ-NP-Za-km-z]{44}$",
        userInputRequired: true,
      },
      {
        type: "number",
        name: "amount",
        userInputRequired: true,
        description:
          "This is the amount to transfer to the recipient, it should be a number with a decimal point, and two decimal places, for example 100.00",
      },
      {
        type: "string",
        name: "type",
        description:
          "This specifies whether the transfer is to a Solana address or a phone number. It should be either 'solana' or 'phone'.",
        enum: ["solana", "phone"],
        assistantSupplied: true,
      },
    ],
    exampleUserInput: "$100 to 1234567890",
    exampleParams: {
      to: "1234567890",
      amount: "100.00",
      type: "phone",
    },
    function: async (params: Record<string, string>) => {
      console.log("Transfer Action Executed: ", params);
      return `Transfered ${params.amount} to ${params.to}`;
    },
  });

  chat.on("assisant", (message: string) => {
    //  console.log("Assistant: ", message);
  });

  console.log("Inputting: ", "can i make a transfer");
  const response = await chat.input("can i make a transfer");
  console.log(response);

  console.log("Inputting: ", "$1 to 1234567890");
  const response2 = await chat.input("$1 to 1234567890");
  console.log(response2);
}

test();
