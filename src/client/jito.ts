import { VersionedTransaction, PublicKey } from "@solana/web3.js";

interface JitoBundleResponse {
  jsonrpc: string;
  result: string; // The bundle signature
  id: number;
}

interface BundleStatusResponse {
  jsonrpc: string;
  result: (BundleStatus | null)[];
  id: number;
}

interface BundleStatus {
  bundle_id: string;
  transactions: string[];  // base-58 encoded signatures
  slot: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
  err?: {
    retryable: boolean;
    message: string;
  };
}

const TIP_ACCOUNTS = [
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
  "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
  "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
  "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
  "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
];

function getRandomTipAccount(): PublicKey {
  const randomIndex = Math.floor(Math.random() * TIP_ACCOUNTS.length);
  return new PublicKey(TIP_ACCOUNTS[randomIndex]);
}

/**
 * Sends a bundle of transactions to Jito's block engine.
 * @param transactions - The transactions to send.
 * @returns The response from Jito's block engine.
 */
async function sendJitoBundle(
  transactions: VersionedTransaction[]
): Promise<JitoBundleResponse> {
  // Convert transactions to base64
  const base64Txns = transactions.map((tx) =>
    Buffer.from(tx.serialize()).toString("base64")
  );

  // Prepare the bundle request
  const bundleRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "sendBundle",
    params: [
      base64Txns,
      {
        encoding: "base64",
      },
    ],
  };

  console.log(bundleRequest);

  // Send the bundle to Jito's block engine
  const response = await fetch(
    "https://mainnet.block-engine.jito.wtf:443/api/v1/bundles",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bundleRequest),
    }
  );

  return await response.json();
}


/**
 * Gets the status of one or more Jito bundles
 * @param bundleIds - Array of bundle IDs to check
 * @returns Array of bundle statuses (null if bundle not found)
 */
async function getInflightBundleStatuses(bundleIds: string[]) {
  const statusRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getInflightBundleStatuses',
    params: [bundleIds]
  };

  const response = await fetch('https://mainnet.block-engine.jito.wtf/api/v1/bundles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusRequest)
  });

  const body = await response.json();

  console.log("inflight bundle statuses", body.result.value);

  return body;
}

/**
 * Gets the status of one or more Jito bundles
 * @param bundleIds - Array of bundle IDs to check
 * @returns Array of bundle statuses (null if bundle not found)
 */
async function getJitoBundleStatus(bundleIds: string[]): Promise<BundleStatusResponse> {
  await getInflightBundleStatuses(bundleIds)
  const statusRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getBundleStatuses',
    params: [bundleIds]
  };

  const response = await fetch('https://mainnet.block-engine.jito.wtf/api/v1/bundles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusRequest)
  });

  const body = await response.json();

  console.log(body);

  return body;
}

/**
 * Gets the transaction signature for a bundle and returns a Solscan link
 * @param bundleId - The bundle ID to check
 * @returns The Solscan link for the second-to-last transaction, or null if not found
 */
async function getBundleTransactionLink(bundleId: string): Promise<string | null> {
  try {
    console.log(bundleId);
    let status: BundleStatusResponse | null = null;
    while (true) {
      status = await getJitoBundleStatus([bundleId]);
      console.log(status);
      if (status.result !== null) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(status);
    
    if (!status.result?.[0]?.transactions) {
      return null;
    }

    const transactions = status.result[0].transactions;
    // Get the second-to-last transaction signature
    const targetTx = transactions[transactions.length - 2];
    
    if (!targetTx) {
      return null;
    }

    return `https://solscan.io/tx/${targetTx}`;
  } catch (error) {
    console.error('Error getting bundle transaction link:', error);
    return null;
  }
}

export {
  sendJitoBundle,
  type JitoBundleResponse,
  getJitoBundleStatus,
  type BundleStatus,
  type BundleStatusResponse,
  getRandomTipAccount,
  getBundleTransactionLink,
};
    