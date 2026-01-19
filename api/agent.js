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
            'did:ethr:sepolia': new EthrDIDProvider(
              { 
                defaultKms: 'local',
                network: 'sepolia',
                rpcUrl: process.env.ETH_RPC_URL,
                registry: '0x03d5003bf0e79c5f5223588f347eba39afbc3818', // Sepolia DID Registry
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
    if (path === '/api/agent/ping' && method === 'GET') {
      return res.status(200).json({ message: 'Veramo Agent is alive!' })
    }

    if (path === '/api/agent/check-did' && method === 'POST') {
        const { walletAddress } = req.body
        
        if (!walletAddress) {
          return res.status(400).json({ error: 'walletAddress is required' })
        }

        const did = `did:ethr:sepolia:${walletAddress}`
        
        // 1. Check Local Store First
        if (global.didStore && global.didStore[walletAddress]) {
          return res.status(200).json({ 
            exists: true, 
            source: 'local_cache',
            did: did,
            identifier: global.didStore[walletAddress],
            username: global.didStore[walletAddress].username,
            createdAt: global.didStore[walletAddress].createdAt
          })
        }

        // 2. Fallback: Check the Blockchain (Real Verification)
        try {
          const { ethers } = await import('ethers')
          const rpcUrl = process.env.ETH_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
          const provider = new ethers.JsonRpcProvider(rpcUrl)
          
          const DID_REGISTRY = '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
          const abi = [
            'function identityOwner(address identity) public view returns (address)',
            'event DIDAttributeChanged(address indexed identity, bytes32 name, bytes value, uint validTo, uint previousChange)'
          ]
          const contract = new ethers.Contract(DID_REGISTRY, abi, provider)

          // In ethr-did, if the identityOwner is not 0x0, it's a valid DID
          const owner = await contract.identityOwner(walletAddress)
          
          if (owner !== '0x0000000000000000000000000000000000000000') {
            let createdAt = null
            let username = null
            
            // Try to get creation date and username from DIDAttributeChanged events
            try {
              const currentBlock = await provider.getBlockNumber()
              const filter = contract.filters.DIDAttributeChanged(walletAddress)
              // Query last 1 million blocks (adjust as needed for Sepolia)
              const events = await contract.queryFilter(filter, Math.max(0, currentBlock - 1000000), currentBlock)
              
              if (events.length > 0) {
                // Sort events by block number
                const sortedEvents = events.sort((a, b) => a.blockNumber - b.blockNumber)
                
                // Get the first event (earliest block) for creation date
                const firstEvent = sortedEvents[0]
                const block = await provider.getBlock(firstEvent.blockNumber)
                createdAt = new Date(block.timestamp * 1000).toISOString()
                
                // Look for username attribute in all events
                for (const event of sortedEvents) {
                  try {
                    const attributeName = ethers.decodeBytes32String(event.args.name)
                    if (attributeName === 'did/pub/username') {
                      username = ethers.toUtf8String(event.args.value)
                      console.log('Found username on blockchain:', username)
                      break
                    }
                  } catch (decodeError) {
                    // Skip events that can't be decoded
                  }
                }
              }
            } catch (eventError) {
              console.error("Failed to fetch blockchain data:", eventError)
            }
            
            return res.status(200).json({
              exists: true,
              source: 'blockchain',
              did: did,
              owner: owner,
              username: username,
              createdAt: createdAt
            })
          }
        } catch (error) {
          console.error("On-chain check failed:", error)
        }

        return res.status(200).json({ exists: false, did: did })
      }

    if (path === '/api/agent/update-did' && method === 'POST') {
      const { walletAddress, username } = req.body
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'walletAddress is required' })
      }

      if (!username) {
        return res.status(400).json({ error: 'username is required' })
      }

      if (!process.env.PRIVATE_KEY) {
        return res.status(500).json({ 
          error: 'Server private key not configured. Please set PRIVATE_KEY environment variable.' 
        })
      }

      try {
        // Dynamic import ethers
        const { ethers } = await import('ethers')
        
        const rpcUrl = process.env.ETH_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        if (!rpcUrl || rpcUrl.includes('undefined')) {
          return res.status(500).json({ 
            error: 'RPC URL not configured. Set ETH_RPC_URL or INFURA_PROJECT_ID.' 
          })
        }

        // Connect to Sepolia
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
        
        // DID Registry contract
        const DID_REGISTRY = '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
        const DID_REGISTRY_ABI = [
          'function setAttribute(address identity, bytes32 name, bytes value, uint validity) external'
        ]
        
        const didRegistry = new ethers.Contract(DID_REGISTRY, DID_REGISTRY_ABI, wallet)
        
        // Set username attribute on blockchain
        const name = ethers.encodeBytes32String('did/pub/username')
        const value = ethers.toUtf8Bytes(username.trim())
        const validity = 86400 * 365 * 10 // 10 years validity
        
        console.log(`Updating username for DID ${walletAddress} on Sepolia...`)
        const tx = await didRegistry.setAttribute(
          walletAddress,
          name,
          value,
          validity
        )
        
        console.log('Transaction sent:', tx.hash)
        const receipt = await tx.wait()
        console.log('Transaction confirmed:', receipt.transactionHash)

        // Initialize global DID store if not exists
        if (!global.didStore) {
          global.didStore = {}
        }

        const did = `did:ethr:sepolia:${walletAddress}`
        
        // Update or create entry in memory
        if (global.didStore[walletAddress]) {
          global.didStore[walletAddress].username = username.trim()
          global.didStore[walletAddress].updatedAt = new Date().toISOString()
        } else {
          global.didStore[walletAddress] = {
            did: did,
            provider: 'did:ethr:sepolia',
            controllerKeyId: walletAddress,
            username: username.trim(),
            keys: [],
            services: [],
            onChain: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
        
        return res.status(200).json({
          success: true,
          did: did,
          username: username.trim(),
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`,
          identifier: global.didStore[walletAddress]
        })
      } catch (error) {
        console.error('Blockchain update error:', error)
        return res.status(500).json({ 
          error: error.message || 'Failed to update username on blockchain' 
        })
      }
    }

    if (path === '/api/agent/create-did' && method === 'POST')  {
      const { walletAddress, username } = req.body
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'walletAddress is required' })
      }

      // Initialize global DID store if not exists
      if (!global.didStore) {
        global.didStore = {}
      }

      const did = `did:ethr:sepolia:${walletAddress}`
      
      // Check if already exists
      if (global.didStore[walletAddress]) {
        return res.status(200).json({ 
          message: 'DID already exists',
          did: did,
          identifier: global.didStore[walletAddress]
        })
      }

      // Create DID identifier (no private key needed, just the DID format)
      const identifier = {
        did: did,
        provider: 'did:ethr:sepolia',
        controllerKeyId: walletAddress,
        username: username,
        keys: [],
        services: [],
        createdAt: new Date().toISOString()
      }

      // Store in memory
      global.didStore[walletAddress] = identifier
      
      return res.status(200).json(identifier)
    }

    if (path === '/api/agent/register-did-onchain' && method === 'POST') {
      const { walletAddress, username } = req.body
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'walletAddress is required' })
      }

      if (!process.env.PRIVATE_KEY) {
        return res.status(500).json({ 
          error: 'Server private key not configured. Please set PRIVATE_KEY environment variable with Sepolia ETH.' 
        })
      }

      try {
        // Dynamic import ethers
        const { ethers } = await import('ethers')
        
        const rpcUrl = process.env.ETH_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        if (!rpcUrl || rpcUrl.includes('undefined')) {
          return res.status(500).json({ 
            error: 'RPC URL not configured. Set ETH_RPC_URL or INFURA_PROJECT_ID.' 
          })
        }

        // Connect to Sepolia
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
        
        // DID Registry contract address and ABI
        const DID_REGISTRY = '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
        const DID_REGISTRY_ABI = [
          'function setAttribute(address identity, bytes32 name, bytes value, uint validity) external',
          'function owner(address identity) external view returns (address)'
        ]
        
        const didRegistry = new ethers.Contract(DID_REGISTRY, DID_REGISTRY_ABI, wallet)
        
        // Set a DID document attribute to register the DID on-chain
        // This registers that this address controls this DID
        const name = ethers.encodeBytes32String('did/pub/Secp256k1/veriKey')
        const value = ethers.toUtf8Bytes(walletAddress) // Store wallet address as the verification key
        const validity = 86400 * 365 * 10 // 10 years validity
        
        console.log(`Registering DID for ${walletAddress} on Sepolia...`)
        const tx = await didRegistry.setAttribute(
          walletAddress,
          name,
          value,
          validity
        )
        
        console.log('Transaction sent:', tx.hash)
        const receipt = await tx.wait()
        console.log('Transaction confirmed:', receipt.transactionHash)
        
        // Get block timestamp for creation date
        const block = await provider.getBlock(receipt.blockNumber)
        const createdAt = new Date(block.timestamp * 1000).toISOString()
        
        // Store in memory
        if (!global.didStore) {
          global.didStore = {}
        }
        
        const did = `did:ethr:sepolia:${walletAddress}`
        const identifier = {
          did: did,
          provider: 'did:ethr:sepolia',
          controllerKeyId: walletAddress,
          username: username || null,
          keys: [],
          services: [],
          onChain: true,
          transactionHash: receipt.Hash,
          blockNumber: receipt.blockNumber,
          createdAt: createdAt
        }
        
        global.didStore[walletAddress] = identifier
        
        return res.status(200).json({
          success: true,
          did: did,
          transactionHash: receipt.Hash,
          blockNumber: receipt.blockNumber,
          createdAt: createdAt,
          explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`
        })
        
      } catch (error) {
        console.error('Blockchain registration error:', error)
        return res.status(500).json({ 
          error: error.message || 'Failed to register DID on blockchain' 
        })
      }
    }

    if (path === '/api/agent/issue-credential' && method === 'POST') {
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
