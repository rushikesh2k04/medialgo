from algopy import *

from algopy.arc4 import abimethod


class NFTContract(ARC4Contract):
    assetid: UInt64
    access_holder: Account
    access_expires_at: UInt64
    access_active: UInt64

    #create the app
    @abimethod(allow_actions=["NoOp"], create="require")
    def create_application(self, asset_id: Asset) -> None:
        self.assetid = asset_id.id
    
     # opt in to the asset into the smart contract
    @abimethod()
    def opt_in_to_asset(self, mbrpay: gtxn.PaymentTransaction) -> None:
        assert Txn.sender == Global.creator_address
        assert not Global.current_application_address.is_opted_in(Asset(self.assetid))

        assert mbrpay.receiver == Global.current_application_address

        assert mbrpay.amount == Global.min_balance + Global.asset_opt_in_min_balance

        itxn.AssetTransfer(
            xfer_asset= self.assetid,
            asset_receiver= Global.current_application_address,
            asset_amount= 0,
            fee=0,
        ).submit()

    @abimethod
    def asset_opt_in_sender(self, asset: Asset) -> None:

        itxn.AssetTransfer(
            asset_receiver=Txn.sender,
            xfer_asset=asset,
            asset_amount=0,
            fee=0,
        ).submit()

    
    # example: ASSET_TRANSFER
    @abimethod
    def asset_transfer_from_app(self, asset: Asset, receiver: Account ) -> None:
        itxn.AssetTransfer(
            sender = Global.current_application_address,
            asset_receiver = receiver,
            xfer_asset = asset,
            asset_amount = 1,
            fee=0,
        ).submit()

    # """
    # For a smart contract to transfer an asset, the app account must be opted into the asset
    # and be holding non zero amount of assets.

    # To send an asset transfer, the asset must be an available resource.
    # Refer the Resource Availability section for more information.
    # """
    # # example: ASSET_TRANSFER

    # # example: ASSET_FREEZE
    # @abimethod
    # def asset_freeze(self, acct_to_be_frozen: Account, asset: Asset) -> None:
    #     itxn.AssetFreeze(
    #         freeze_account=acct_to_be_frozen,  # account to be frozen
    #         freeze_asset=asset,
    #         frozen=True,
    #         fee=0,
    #     ).submit()

    # """
    # To freeze an asset, the asset must be a freezable asset
    # by having an account with freeze authority.
    # """
    # # example: ASSET_FREEZE

    # # example: ASSET_REVOKE
    # @abimethod
    # def asset_revoke(
    #     self, asset: Asset, account_to_be_revoked: Account, amount: UInt64
    # ) -> None:
    #     itxn.AssetTransfer(
    #         asset_receiver=Global.current_application_address,
    #         xfer_asset=asset,
    #         asset_sender=account_to_be_revoked,  # AssetSender is only used in the case of clawback
    #         asset_amount=amount,
    #         fee=0,
    #     ).submit()

    # """
    # To revoke an asset, the asset must be a revocable asset
    # by having an account with clawback authority.

    # Sender is implied to be current_application_address
    # """
    # # example: ASSET_REVOKE

    # # example: ASSET_CONFIG
    # @abimethod
    # def asset_config(self, asset: Asset) -> None:
    #     itxn.AssetConfig(
    #         config_asset=asset,
    #         manager=Global.current_application_address,
    #         reserve=Global.current_application_address,
    #         freeze=Txn.sender,
    #         clawback=Txn.sender,
    #         fee=0,
    #     ).submit()

    # """
    # For a smart contract to transfer an asset, the app account must be opted into the asset
    # and be holding non zero amount of assets.

    # To send an asset transfer, the asset must be an available resource.
    # Refer the Resource Availability section for more information.
    # """
    # # example: ASSET_CONFIG

    # # example: ASSET_DELETE
    # @abimethod
    # def asset_delete(self, asset: Asset) -> None:
    #     itxn.AssetConfig(
    #         config_asset=asset,
    #         fee=0,
    #     ).submit()

    # # example: ASSET_DELETE


class NFTRevoke(ARC4Contract):
    assetid: UInt64
    access_holder: Account
    access_expires_at: UInt64
    access_active: UInt64  # 1 if active, 0 if not

    @abimethod(allow_actions=["NoOp"], create="require")
    def create_application(self, asset_id: Asset) -> None:
        self.assetid = asset_id.id
        self.access_holder = Global.zero_address
        self.access_expires_at = UInt64(0)
        self.access_active = UInt64(0)

    @abimethod
    def asset_config_clawback(self, asset: Asset) -> None:
        assert asset.manager == Txn.sender
        itxn.AssetConfig(
            config_asset=asset,
            manager= Txn.sender,
            clawback=Global.current_application_address, # Set clawback to app address
            fee=0,
        ).submit()

    @abimethod()
    def opt_in_to_asset(self, mbrpay: gtxn.PaymentTransaction) -> None:
        assert Txn.sender == Global.creator_address
        assert not Global.current_application_address.is_opted_in(Asset(self.assetid))

        assert mbrpay.receiver == Global.current_application_address

        assert mbrpay.amount == Global.min_balance + Global.asset_opt_in_min_balance

        itxn.AssetTransfer(
            xfer_asset= self.assetid,
            asset_receiver= Global.current_application_address,
            asset_amount= 0,
            fee=0,
        ).submit()

    @abimethod()
    def grant_access(self, holder: Account, duration_secs: UInt64) -> None:
        assert self.access_active == 0, "Access already active"

        self.access_holder = holder
        self.access_expires_at = Global.latest_timestamp + duration_secs
        self.access_active = UInt64(1)

        # Send the NFT to the holder
        itxn.AssetTransfer(
            asset_receiver=holder,
            xfer_asset=self.assetid,
            asset_amount=1,
            fee=0
        ).submit()

    @abimethod()
    def revoke_access(self) -> None:
        assert self.access_active == 1, "No active access"
        assert Global.latest_timestamp > self.access_expires_at, "Access not yet expired"

        # Clawback the NFT from the holder
        itxn.AssetTransfer(
            asset_receiver=Global.current_application_address,
            xfer_asset=self.assetid,
            asset_sender=self.access_holder,
            asset_amount=1,
            fee=0
        ).submit()

        self.access_active = UInt64(0)
        self.access_holder = Global.zero_address
        self.access_expires_at = UInt64(0)

    @abimethod()
    def emergency_revoke(self) -> None:
        """Allow immediate revocation before expiry (e.g., if the prescription was misused)"""
        assert self.access_active == 1, "No active access"

        itxn.AssetTransfer(
            asset_receiver=Global.current_application_address,
            xfer_asset=self.assetid,
            asset_sender=self.access_holder,
            asset_amount=1,
            fee=0
        ).submit()

        self.access_active = UInt64(0)
        self.access_holder = Global.zero_address
        self.access_expires_at = UInt64(0)

    @abimethod()
    def get_status(self) -> tuple[Account, UInt64, UInt64]:
        """Returns (current holder, expiry time, active flag)"""
        return self.access_holder, self.access_expires_at, self.access_active
