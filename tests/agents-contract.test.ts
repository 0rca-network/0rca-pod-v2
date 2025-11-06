import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils';
import { AgentsContractClient, AgentsContractFactory } from '@/contracts/AgentContracts';
import { LoggingContractClient, LoggingContractFactory } from '@/contracts/LogginContract';
import algosdk, { OnApplicationComplete } from 'algosdk';
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount';

describe('AgentsContract Deployment', () => {
  let algorand: AlgorandClient;
  let deployer: algosdk.Account;

  beforeAll(async () => {
    algorand = AlgorandClient.testNet();

    // Create account from mnemonic
    const mnemonic = "announce feed swing base certain rib rose phrase crouch rotate voyage enroll same sort flush emotion pulp airport notice inject pelican zero blossom about honey";
    deployer = algosdk.mnemonicToSecretKey(mnemonic);

    // Fund account if needed (testnet)
    try {
      const accountInfo = await algorand.account.getInformation(deployer.addr);
      if (accountInfo.balance.microAlgo < 1000000) { // Less than 1 ALGO
        console.log('Account needs funding on testnet');
      }
    } catch (error) {
      console.log('Account not found, may need funding');
    }
  });

  it('should deploy the AgentsContract', async () => {
    // Create the typed app factory
    const signer = algosdk.makeBasicAccountTransactionSigner(deployer)

    const appFactory = new AgentsContractFactory({
      defaultSender: deployer.addr,
      defaultSigner: signer,
      algorand,
    })

    // Deploy the contract with required parameters
    const { appClient } = await appFactory.send.create.createApplication({
      args: {
        maintainerAddress: deployer.addr.toString(),
      },
      sender: deployer.addr,
      signer: signer,
      onComplete: OnApplicationComplete.NoOpOC,
    });

    // Verify deployment
    expect(appClient.appId).toBeDefined();
    expect(appClient.appId).toBeGreaterThan(0);
    console.log('Deployed AgentsContract App ID:', appClient.appId);
  });

  it('should create an agent', async () => {
    // Deploy contract first
    const signer = algosdk.makeBasicAccountTransactionSigner(deployer)
    const appFactory = new AgentsContractFactory({
      defaultSender: deployer.addr,
      defaultSigner: signer,
      algorand,
    })

    const { appClient } = await appFactory.send.create.createApplication({
      args: {
        maintainerAddress: deployer.addr.toString(),
      },
      sender: deployer.addr,
      signer: signer,
      onComplete: OnApplicationComplete.NoOpOC,
    });
    await algorand.send.payment({
      sender: deployer.addr,
      receiver: appClient.appAddress,
      amount: AlgoAmount.Algo(0.9),
      signer: signer
    })
    // Create an agent
    await appClient.send.createAgent({
      args: {
        agentName: "Test Agent",
        agentIpfs: "QmTestHash123",
        pricing: 1000000, // 1 ALGO in microAlgos
        agentImage: "test-creator"
      },
      sender: deployer.addr,
      signer: signer,
      staticFee: AlgoAmount.Algo(0.02)
    });

    console.log('Successfully created agent on App ID:', appClient.appId);
    expect(appClient.appId).toBeDefined();
  });

  it('should deploy LoggingContract and emit log', async () => {
    const signer = algosdk.makeBasicAccountTransactionSigner(deployer)
    
    const loggingFactory = new LoggingContractFactory({
      defaultSender: deployer.addr,
      defaultSigner: signer,
      algorand,
    })

    // Deploy LoggingContract
    const { appClient: loggingClient } = await loggingFactory.send.create.createApplication({
      args: {ownerAddress: deployer.addr.toString()

      },
      sender: deployer.addr,
      signer: signer,
      onComplete: OnApplicationComplete.NoOpOC,
    });

    console.log('Deployed LoggingContract App ID:', loggingClient.appId);

    // Emit a log
    await loggingClient.send.emitLog({
      args: {
        eventName: "Test Event",
        agentId: BigInt(loggingClient.appId),
        status: "success"
      },
      sender: deployer.addr,
      signer: signer,
    });

    console.log('Successfully emitted log on App ID:', loggingClient.appId);
    expect(loggingClient.appId).toBeDefined();
    expect(loggingClient.appId).toBeGreaterThan(0);
  });
});