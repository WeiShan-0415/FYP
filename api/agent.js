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
          resolver: new Resolver({
            ...getDidKeyResolver(),
            ...getEthrResolver({ infuraProjectId: process.env.INFURA_PROJECT_ID || '' }),
            ...getWebResolver(),
          }),
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
