// src/components/Home.tsx
import * as algokit from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useEffect, useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import MethodCall from './components/MethodCall'
import * as methods from './methods'
import * as revokeMethods from './revoke_methods'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'
import NFTForm from './components/NFTForm'
import algosdk from 'algosdk'
import './styles/Home.css'
import { NftContractClient, NftContractFactory } from './contracts/NFTContract'
import { NftRevokeClient, NftRevokeFactory } from './contracts/NFTRevoke'

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const { activeAccount, activeAddress, transactionSigner: TransactionSigner } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  const [inputAppId, setInputAppId] = useState("");
  const [inputAssetId, setInputAssetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState<bigint>(BigInt(0))
  const [assetId, setAssetId] = useState<bigint>(0n)
  const [assetname, setassetname] = useState<string>("")
  const [patientwallet, setpatientwallet] = useState<string>("")
  const [unitname, setunitname] = useState<string>("")
  const [ipfsCID, setIpfsCID] = useState<string>("")
    const [revokeAppId, setRevokeAppId] = useState<bigint>(0n)

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
  algorand.setDefaultSigner(TransactionSigner)

  const nftFactory = new NftContractFactory({
    algorand: algorand,
    defaultSender: activeAccount?.address,
    defaultSigner: TransactionSigner,
  })

  const nftClient = new NftContractClient({
    appId: BigInt(appId),
    algorand: algorand,
    defaultSigner: TransactionSigner,
  })

  const revokeFactory = new NftRevokeFactory({
    algorand: algorand,
    defaultSender: activeAccount?.address,
    defaultSigner: TransactionSigner,
  })

  const revokeClient = new NftRevokeClient({
    appId: BigInt(revokeAppId), // Placeholder; will be reset after app creation
    algorand,
    defaultSigner: TransactionSigner,
  })

  useEffect(() => {
    if (TransactionSigner) algorand.setDefaultSigner(TransactionSigner)
  }, [TransactionSigner])

  return (
    <div className="home-container">
      <div className="form-card">
        <h1>Welcome to <span className="bold">AlgoKit 🙂</span></h1>
        <p className="subtitle">Sell your asset at your fingertips</p>

        <button className="wallet-btn" onClick={toggleWalletModal}>
          Wallet Connection
        </button>

        <label>Asset Name</label>
        <input
          type="text"
          value={assetname}
          onChange={(e) => setassetname(e.currentTarget.value || "")}
        />
        <label>Patients Wallet Address</label>
        <input
          type="text"
          value={patientwallet}
          onChange={(e) => setpatientwallet(e.currentTarget.value || "")}
        />
        <label>Unit Name</label>
        <input
          type="text"
          value={unitname}
          onChange={(e) => setunitname(e.currentTarget.value || "")}
        />

        <h2>Upload NFT Metadata</h2>
        <NFTForm onUploadComplete={(cid) => setIpfsCID(cid)} />

        <MethodCall
          methodFunction={async () => {
            if (!ipfsCID) {
              alert("Upload metadata to IPFS first.")
              return
            }

            const assetUrl = `https://ipfs.io/ipfs/${ipfsCID}#arc3`
            const newAssetId = await methods.create(
              algorand,
              activeAddress!,
              assetname,
              assetUrl,
              patientwallet,
              unitname,
            )
            setAssetId(newAssetId)
          }}
          text="Create Asset"
        />
        {assetId !== 0n && (
  <div className="asset-id-display">
    <p><strong>Asset ID:</strong> {assetId.toString()}</p>
  </div>
)}

        <MethodCall
        methodFunction={ async () => {
          if (assetId === 0n) {
            alert("Create the Asset First !!!")
          }

          const createApp = methods.createApplication(
            algorand,
            nftClient,
            nftFactory,
            TransactionSigner,
            activeAddress!,
            assetId,
            setAppId
          )

          const newAppId = await createApp()
          setAppId(newAppId)

        }}
        text = "Create App"
        />
        {
          appId !== 0n && (
            <div className='asset-id-display'>
              <p><strong>Application ID:</strong> {appId.toString()}</p>
            </div>
          )
        }

        {/* <MethodCall
  methodFunction={async () => {
    if (assetId === 0n) {
      alert("Create the Asset first!");
      return;
    }
    setLoading(true);
    try {
      const transfer = methods.transferAsset(
        algorand,
        nftClient,
        TransactionSigner,
        activeAddress!,
        assetId
      );
      await transfer();
      alert("Transfer successful!");
    } catch (error) {
      alert("Transfer failed: ");
    } finally {
      setLoading(false);
    }
  }}
  text={loading ? "Processing..." : "Get the asset"}
/> */}
          {/* <MethodCall
          methodFunction={ async () => {
            if (assetId === 0n) {
            alert("Create the Asset first!");
            return;
            }
          setLoading(true);
          try {
              const optin = methods.optIn(
              algorand,
              TransactionSigner,
              activeAddress!,
              assetId
            );
          await optin();
          alert("Opt in successful!");
          } catch (error) {
          alert("Opt in failed: ");
          } finally {
          setLoading(false);
          }
            }}
            text = "Opt in"
            /> */}

          {/* <MethodCall
          methodFunction={ async () =>{
            setLoading(true);
            try{
              const transfering = methods.assetTransferfromapp(
                algorand,
                nftClient,
                TransactionSigner,
                String(algosdk.getApplicationAddress(appId)),
                assetId,
                activeAddress!,
              );
              await transfering();
              alert("Asset"+assetId+"transfered"+activeAddress)
            }
            catch(error) {
              console.log("Asste transfer is failed");
            } finally {
              setLoading(false);
            }
          }}
          text = "Transfer"
          /> */}

          <div className="flex flex-col gap-2">
            <label>
             App ID:
              <input
                type="text"
                value={inputAppId}
                onChange={(e) => setInputAppId(e.target.value)}
                className="border p-1 rounded"
              />
            </label>

            <label>
              Asset ID:
              <input
                type="text"
                value={inputAssetId}
                onChange={(e) => setInputAssetId(e.target.value)}
                className="border p-1 rounded"
              />
            </label>
          </div>

          <MethodCall
  methodFunction={async () => {
    setLoading(true);
    try {
      if (!activeAccount) throw new Error('Please connect wallet first')
      if (!inputAppId) throw new Error('App ID is required')
      const appId = BigInt(inputAppId);
      const assetId = BigInt(inputAssetId);
      const appAddress = algosdk.getApplicationAddress(appId);

      const nftClient = new NftContractClient({
        appId: BigInt(appId),
        algorand: algorand,
        defaultSigner: TransactionSigner,
      })

      const transfer = methods.assetFromApp(
        algorand,
        nftClient,
        TransactionSigner,
        activeAddress!,
        assetId,
      );

      await transfer();
      alert(`Asset ${assetId} transferred to ${activeAddress}`);
    } catch (err) {
      console.error(err);
      alert("Transfer failed. See console for details.");
    } finally {
      setLoading(false);
    }
  }}
  text={loading ? "Transferring..." : "Transfer from App"}
/>


<MethodCall
  methodFunction={async () => {
    setLoading(true);
    try {
      if (!activeAccount) throw new Error('Please connect your wallet.');
      if (!inputAssetId) throw new Error('Asset ID is required for revoke.');

      const parsedAssetId = BigInt(inputAssetId);
      const newRevokeAppId = await revokeMethods.createApplication(
        algorand,
        revokeClient,
        revokeFactory,
        TransactionSigner,
        activeAddress!,
        parsedAssetId,
        setRevokeAppId
      );

      const newAppId = await newRevokeAppId()
      setRevokeAppId(newAppId)

      alert(`Revoke App Created with ID:  ${revokeAppId}`);
    } catch (err) {
      console.error(err);
      alert('Revoke App Creation failed. See console for details.');
    } finally {
      setLoading(false);
    }
  }}
  text={loading ? "Creating Revoke App..." : "Create Revoke Application"}
/>
{
          appId !== 0n && (
            <div className='asset-id-display'>
              <p><strong>Application ID:</strong> {revokeAppId.toString()}</p>
            </div>
          )
        }
      <MethodCall
      methodFunction={ async () => {
        try{
          const parsedAssetId = BigInt(inputAssetId);
          const parsedAppId = BigInt(revokeAppId);
          const clawbackAddress = await revokeMethods.changeClawBack(
            algorand,
            TransactionSigner,
            parsedAppId,
            activeAddress!,
            parsedAssetId
          )

          const result = await clawbackAddress();
          console.log(result," Successfull")
        } catch (err){
          console.error(err);
          alert(" Failed to Change the cLawback address:");
        } finally {

        }
      }}
      text = "change claw back"/>


        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  )
}

export default Home
