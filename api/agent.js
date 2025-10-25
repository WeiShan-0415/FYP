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
    const { getResolver: getWebResolver } = await import('web-did-resolver')

    // Build resolver mapping conditionally. The ethr resolver requires at least one network
    // (Infura project ID or explicit RPC network). Only include it when config is present.
    const didKeyResolver = getDidKeyResolver()
    const webResolver = getWebResolver()
    const resolvers = {
      ...didKeyResolver,
      ...webResolver,
    }

    // Include Ethereum resolver if Infura project ID or ETH_RPC_URL provided
    if (process.env.INFURA_PROJECT_ID) {
      Object.assign(resolvers, getEthrResolver({ infuraProjectId: process.env.INFURA_PROJECT_ID }))
      console.log('ethr-did-resolver included via INFURA_PROJECT_ID')
    } else if (process.env.ETH_RPC_URL) {
      // ethr-did-resolver accepts networks option; supply a single RPC network
      Object.assign(resolvers, getEthrResolver({ networks: [{ name: 'custom', rpcUrl: process.env.ETH_RPC_URL }] }))
      console.log('ethr-did-resolver included via ETH_RPC_URL')
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
          defaultProvider: 'did:key',
          providers: {
            'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
          },
        }),
        new DIDResolverPlugin({
          resolver: new Resolver(resolvers),
        }),
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
  // simple router for /api/agent/ping and /api/agent/create-did
  try {
    if (url.endsWith('/ping') && method === 'GET') {
      return res.status(200).json({ message: '✅ Veramo Agent is alive!' })
    }

    if (url.endsWith('/create-did') && method === 'GET') {
      const agent = await getAgent()
      const identifier = await agent.didManagerCreate({ provider: 'did:key' })
      return res.status(200).json(identifier)
    }

    res.status(404).json({ error: 'not found' })
  } catch (err) {
    console.error('Agent error:', err)
    res.status(500).json({ error: err.message || String(err) })
  }
}
