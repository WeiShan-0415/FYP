import { cloneElement } from 'react'

let cachedAgent = null

async function getAgent() {
  if (cachedAgent) return cachedAgent

  try {
    // dynamic import ESM-only modules at runtime
    await import('reflect-metadata')
    const { createAgent } = await import('@veramo/core')
    const { DIDManager, MemoryDIDStore } = await import('@veramo/did-manager')
    const { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } = await import('@veramo/key-manager')
    const { KeyManagementSystem } = await import('@veramo/kms-local')
    const { DIDResolverPlugin } = await import('@veramo/did-resolver')
    const { Resolver } = await import('did-resolver')
    const { getDidKeyResolver, KeyDIDProvider } = await import('@veramo/did-provider-key')
    const { getResolver: getEthrResolver } = await import('ethr-did-resolver')
    const{EthrDidProvider}=await import('@veramo/did-provider-ethr')
    const { EthrDIDProvider } = await import('@veramo/did-provider-ethr')
    const { getResolver: getWebResolver } = await import('web-did-resolver')
    const {CredentialPlugin}=await import('@veramo/credential-w3c')

    // Build resolver mapping conditionally. The ethr resolver requires at least one network
    // (Infura project ID or explicit RPC network). Only include it when config is present.
    const didKeyResolver = getDidKeyResolver()
    const webResolver = getWebResolver()
    const resolvers = {}
if (process.env.INFURA_PROJECT_ID) {
    Object.assign(
      resolvers,
      getEthrResolver({
        networks: [
          {
            name: 'sepolia',
            rpcUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
          },
        ],
      })
    )
    console.log('ethr-did-resolver included via INFURA_PROJECT_ID (sepolia)')
  } else if (process.env.ETH_RPC_URL) {
    Object.assign(
      resolvers,
      getEthrResolver({
        networks: [
          {
            name: 'sepolia',
            rpcUrl: process.env.ETH_RPC_URL,
          },
        ],
      })
    )
    console.log('ethr-did-resolver included via ETH_RPC_URL (sepolia)')
  } else {
    console.log('ethr-did-resolver not included (no INFURA_PROJECT_ID or ETH_RPC_URL)')
  }
    const agent = createAgent({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: {
            local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDManager({
          store: new MemoryDIDStore(),
          defaultProvider: 'did:ethr:sepolia',
          providers: 
          {
            'did:ethr:sepolia': new KeyDIDProvider(
              { 
                defaultKms: 'local',
                network: 'sepolia',
                rpcUrl: process.env.ETH_RPC_URL,
                chainId: 11155111,
                privateKeyHex:process.env.PRIVATE_KEY
              }),
              'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
            },
        }),
        new DIDResolverPlugin({
          resolver: new Resolver(resolvers),
        }),
        new CredentialPlugin(),
      ],
    })

    cachedAgent = agent
    return agent
  } catch (err) {
    console.error('Failed to dynamically import Veramo modules:', err)
    throw err
  }
}

export default async function handler(req, res) {
  const { method, url } = req
  console.log('Incoming request:', method, url)
  const path = new URL(req.url, `http://${req.headers.host}`).pathname

  try {
    if (path === '/api/ping' && method === 'GET') {
      return res.status(200).json({ message: '✅ Veramo Agent is alive!' })
    }

    if (path === '/api/create-did' && method === 'GET')  {
      const agent = await getAgent()
      const identifier = await agent.didManagerCreate({ provider: 'did:ethr:sepolia' })
      return res.status(200).json(identifier)
    }
    if (path === '/api/issue-credential' && method === 'POST') {
      const agent = await getAgent()
      const { subjectDID, name, degree } = req.body

      // create issuer did if needed
      const issuer = await agent.didManagerGetOrCreate({ provider: 'did:ethr:sepolia' })
      //build credential
      const credential = await agent.createVerifiableCredential({
        credential:{
          issuer: { id: issuer.did },
          credentialSubject: {
            id: subjectDID,
            name:name,
            degree:degree
          },
          type:['VerifiableCredential','UniversityDegreeCredential'],
          issuanceDate: new Date().toISOString(),
        },
        proofFormat:'jwt',
      })
      return res.status(200).json(credential)
    }
    res.status(404).json({ error: 'not found' })
  } catch (err) {
    console.error('Agent error:', err)
    res.status(500).json({ error: err.message || String(err) })
  }
}
