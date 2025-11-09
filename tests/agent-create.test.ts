import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { AgentsContractClient } from '@/contracts/AgentContracts';
import algosdk from 'algosdk';
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount';

// describe('Agent Create Test', () => {
//   let algorand: AlgorandClient;
//   let deployer: algosdk.Account;
//   const DEFAULT_APP_ID = 749223216;

//   beforeAll(async () => {
//     algorand = AlgorandClient.testNet();

//     // Create account from mnemonic
//     const mnemonic = "announce feed swing base certain rib rose phrase crouch rotate voyage enroll same sort flush emotion pulp airport notice inject pelican zero blossom about honey";
//     deployer = algosdk.mnemonicToSecretKey(mnemonic);
//   });

//   it('should create an agent using default app ID', async () => {
//     const signer = algosdk.makeBasicAccountTransactionSigner(deployer);
    
//     // Connect to existing contract using default app ID
//     const appClient = new AgentsContractClient({
//       appId: BigInt(DEFAULT_APP_ID),
//       defaultSender: deployer.addr,
//       defaultSigner: signer,
//       algorand,
//     });
//     await algorand.send.payment({
//       sender: deployer.addr,
//       receiver: appClient.appAddress,
//       amount: AlgoAmount.Algo(0.9),
//       signer: signer
//     })
//     // Create an agent
//     const AgentContractID = await appClient.send.createAgent({
//       args: {
//         agentName: "Test Agent",
//         agentIpfs: "QmTestHash123",
//         pricing: 1000000, // 1 ALGO in microAlgos
//         agentImage: "test-creator"
//       },
//       sender: deployer.addr,
//       signer: signer,
//       staticFee: AlgoAmount.Algo(0.02)
//     }).then((result) => result.return?.valueOf);

//     console.log('Successfully created agent with App ID:', AgentContractID);
//     expect(DEFAULT_APP_ID).toBeDefined();
//   });
// });