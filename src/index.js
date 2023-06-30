const Web3 = require('web3');
const ContractKit = require('@celo/contractkit');

async function main() {
  const web3 = new Web3('https://alfajores-forno.celo-testnet.org');
  const kit = ContractKit.newKitFromWeb3(web3);

  const account = web3.eth.accounts.create();
  const privateKey = account.privateKey;
  const senderAddress = account.address;

  kit.connection.addAccount(privateKey);

  const messaging = await kit.contracts.getContract('Messaging');

  const recipientAddress = '<recipient-address>';
  const message = 'Hello, world!';

  const encryptedMessage = await messaging.encrypt(senderAddress, recipientAddress, message);
  await messaging.sendEncryptedMessage(recipientAddress, encryptedMessage);

  const incomingMessages = await messaging.getIncoming();
  incomingMessages.forEach(async (encryptedMessage) => {
    const decryptedMessage = await messaging.decrypt(senderAddress, encryptedMessage);
    console.log(`Received message: ${decryptedMessage}`);
  });
}

main().catch(console.error);

//Note that <recipient-address> in the src/index.js file should be replaced with the actual Celo address of the recipient.
