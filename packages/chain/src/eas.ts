/**
 * EAS (Ethereum Attestation Service) integration.
 * Queries attestations from the easscan.org GraphQL API.
 */

// Schema definition — register once via ISchemaRegistry
export const DISCOVERY_SCHEMA =
  'bytes32 claim_hash,' +
  'bytes32 source_commitment,' +
  'bytes32 consensus_hash,' +
  'bytes   zk_proof,' +
  'string  ipfs_cid,' +
  'address atlas_node,' +
  'string  ens_name';

// Base Sepolia EAS contract address
export const EAS_ADDRESS = '0x4200000000000000000000000000000000000021' as `0x${string}`;

// Base Sepolia Schema Registry
export const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020' as `0x${string}`;

// EAS GraphQL endpoint (Base Sepolia)
const EAS_GRAPHQL = 'https://base-sepolia.easscan.org/graphql';

export interface EASAttestation {
  id: string;
  data: string;
  time: number;
  txid: string;
  recipient: string;
  attester: string;
  revoked: boolean;
  decodedDataJson: string;
}

export async function getAttestation(easUid: `0x${string}`): Promise<EASAttestation | null> {
  const query = `{
    attestation(where: { id: { equals: "${easUid}" } }) {
      id
      data
      time
      txid
      recipient
      attester
      revoked
      decodedDataJson
    }
  }`;

  const res = await fetch(EAS_GRAPHQL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`EAS GraphQL error: ${res.status}`);
  const { data } = (await res.json()) as { data: { attestation: EASAttestation | null } };
  return data.attestation;
}

export async function listAttestationsBySchema(
  schemaUid: `0x${string}`,
  limit = 10
): Promise<EASAttestation[]> {
  const query = `{
    attestations(
      where: { schemaId: { equals: "${schemaUid}" } }
      orderBy: { time: desc }
      take: ${limit}
    ) {
      id
      data
      time
      txid
      recipient
      attester
      revoked
      decodedDataJson
    }
  }`;

  const res = await fetch(EAS_GRAPHQL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`EAS GraphQL error: ${res.status}`);
  const { data } = (await res.json()) as { data: { attestations: EASAttestation[] } };
  return data.attestations ?? [];
}
