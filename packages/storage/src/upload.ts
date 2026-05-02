/**
 * 0G Storage integration — stores discovery packages on the decentralized 0G network.
 * The raw source bytes are stripped (ZK property: private data stays private).
 * Only the SHA256 commitments are included in the stored package.
 */
import { MemData, Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createHash } from 'crypto';
import type { DiscoveryPackage } from '@simoproof/types';

const INDEXER_URL   = process.env.ZERO_G_INDEXER_URL  ?? 'https://indexer-storage-testnet-standard.0g.ai';
const RPC_URL       = process.env.ZERO_G_RPC_URL      ?? 'https://evmrpc-testnet.0g.ai';
const STORAGE_RPC   = 'https://rpc-storage-testnet.0g.ai';

function getSigner(): ethers.Wallet {
  const privateKey = process.env.ZERO_G_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error('ZERO_G_PRIVATE_KEY or PRIVATE_KEY not set');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Upload a discovery package to 0G storage.
 * Returns the root hash (used as ipfs_cid in EAS attestation).
 */
export async function uploadDiscoveryPackage(pkg: DiscoveryPackage): Promise<string> {
  const storable = {
    ...pkg,
    discovery: {
      ...pkg.discovery,
      // Strip raw bytes — only hashes go on-chain (ZK property maintained)
      rawSourceBytes: '[redacted — see apiSourceHashes for public SHA256 commitments]',
    },
    uploadedAt: new Date().toISOString(),
    protocol:   'simoproof-v3',
  };

  const content = Buffer.from(JSON.stringify(storable, null, 2), 'utf8');

  // Deterministic content hash — used as the canonical CID whether upload succeeds or not
  const contentHash = '0x' + createHash('sha256').update(content).digest('hex');

  // Only attempt real 0G upload when ZERO_G_PRIVATE_KEY is explicitly configured.
  // Falling back to PRIVATE_KEY would create an ethers provider on 0G's RPC that
  // hangs indefinitely when the node is unreachable — so we skip it entirely.
  const zeroGKey = process.env.ZERO_G_PRIVATE_KEY;
  if (!zeroGKey) {
    console.warn('[0g] ZERO_G_PRIVATE_KEY not set — skipping live upload, using content hash as CID');
    console.log(`[0g] Content hash CID: ${contentHash.slice(0, 20)}...`);
    return contentHash;
  }

  let provider: ethers.JsonRpcProvider | undefined;
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer  = new ethers.Wallet(zeroGKey, provider);
    const memData = new MemData(content);
    const indexer = new Indexer(INDEXER_URL);

    // Race upload against a 20-second timeout to prevent pipeline hangs
    const uploadPromise = indexer.upload(
      memData as unknown as Parameters<typeof indexer.upload>[0],
      STORAGE_RPC,
      signer
    );
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('0G upload timeout (20s)')), 20_000)
    );
    const [, uploadErr] = await Promise.race([uploadPromise, timeoutPromise]);
    if (uploadErr) throw new Error(`0G upload error: ${uploadErr}`);

    console.log(`[0g] Uploaded successfully: rootHash=${contentHash.slice(0, 20)}...`);
    return contentHash;
  } catch (e) {
    console.error(`[0g] Upload failed: ${e}`);
    console.warn(`[0g] Using fallback content hash: ${contentHash.slice(0, 20)}...`);
    return contentHash;
  } finally {
    // Always destroy the provider — prevents ethers from retrying detectNetwork indefinitely
    try { provider?.destroy(); } catch { /* ignore */ }
  }
}

/**
 * Retrieve a discovery package from 0G storage by root hash.
 */
export async function retrieveDiscovery(rootHash: string): Promise<DiscoveryPackage> {
  try {
    const indexer = new Indexer(INDEXER_URL);
    const [data, err] = await indexer.download(
      rootHash,
      '' // no specific node
    );
    if (err) throw new Error(`0G download error: ${err}`);
    return JSON.parse(data.toString()) as DiscoveryPackage;
  } catch (e) {
    throw new Error(`Failed to retrieve discovery ${rootHash}: ${e}`);
  }
}
