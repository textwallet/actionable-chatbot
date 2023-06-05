import ActionableChatbot from "..";

async function test() {
  const chat = new ActionableChatbot({
    apiKey: "",
    org: "",
  });

  chat.setDescription(
    "You are a chatbot that interacts with a users Solana wallet to help them view balances, transfer funds, and more."
  );
  chat.addAction({
    name: "balance",
    description:
      "This action will return the balance of the of a specified wallet.",
    params: [
      {
        type: "string",
        name: "address",
        description:
          "This is the address of the wallet to view the balance of.",
      },
    ],
    function: async (params: Record<string, string>) => {
      console.log("Viewing balance", params.address);
    },

    exampleUserInput:
      "what is the balance of 6nqJTS74Kn12tBEWWSQvDsnDMhTCvf5WrNpK9xGXBC1S",
    exampleParams: {
      address: "6nqJTS74Kn12tBEWWSQvDsnDMhTCvf5WrNpK9xGXBC1S",
    },
  });

  chat.addAction({
    name: "transfer",
    description:
      "This action will transfer funds from the current users wallet to another wallet.",
    params: [
      {
        type: "string",
        name: "address",
        description:
          "This is the address of the solana wallet to send the funds to.",
      },
      {
        type: "string",
        name: "amount",
        description: "This is the amount of funds to send to the wallet.",
      },
    ],
    function: async (params: Record<string, string>) => {
      console.log("Sending funds,", params.address, params.amount);
    },

    exampleUserInput:
      "send 1 sol to 6nqJTS74Kn12tBEWWSQvDsnDMhTCvf5WrNpK9xGXBC1S",
    exampleParams: {
      address: "6nqJTS74Kn12tBEWWSQvDsnDMhTCvf5WrNpK9xGXBC1S",
      amount: "1",
    },
  });

  /*
  chat.on("assisant", (message: string) => {
      console.log("Assistant Said: ", message);
  });
  */
  console.log("Inputting: ", "hey how r u.");
  const response = await chat.input("hey how r u", [
    {
      name: "User Address",
      value: "7feVPmLwE5dhtcgWUUjXxTkcerc4sH9HRV1qQsEx97GW",
    },
  ]);
  console.log(response);
  console.log("Inputting: ", "whats my balance");
  const response2 = await chat.input("whats my balance", [
    {
      name: "User Address",
      value: "7feVPmLwE5dhtcgWUUjXxTkcerc4sH9HRV1qQsEx97GW",
    },
  ]);
  console.log(response2);

  console.log(
    "Inputting: ",
    "what's the balance of  7feVPmLwE5dhtcgWUUjXxTkcerc4sH9HRV1qQsEx97GW"
  );
  const response3 = await chat.input(
    "what's the balance of  7feVPmLwE5dhtcgWUUjXxTkcerc4sH9HRV1qQsEx97GW"
  );
  console.log(response3);
  console.log(
    "Inputting: ",
    "send 0.001 to 7feVPmLwE5dhtcgWUUjXxTkcerc4sH9HRV1qQsEx97GW"
  );

  console.log("Inputting: ", "can i make a transfer");
  const response4 = await chat.input("can i make a transfer", [
    {
      name: "User Address",
      value: "7feVPmLwE5dhtcgWUUjXxTkcerc4sH9HRV1qQsEx97GW",
    },
  ]);
  console.log(response4);

  const response5 = await chat.input(
    "0.001 to 7feVPmLwE5dhtcgWUUjXxTkcerc4sH9HRV1qQsEx97GW",
    [
      {
        name: "User Address",
        value: "7feVPmLwE5dhtcgWUUjXxTkcerc4sH9HRV1qQsEx97GW",
      },
    ]
  );
  console.log(response5);

  const response6 = await chat.input(
    "Create a chat action describing the result of this action action just executed ",
    [
      {
        name: "User Address",
        value: "7feVPmLwE5dhtcgWUUjXxTkcerc4sH9HRV1qQsEx97GW",
      },
    ]
  );
  console.log(response6);
}

test();
