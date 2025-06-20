const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  let nftMarketplace;
  let owner, buyer;

  beforeEach(async function () {
    const MarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await MarketplaceFactory.deploy(); // nftMarketplace is an instance of the NFTMarketplace contract ..represents the deployed contract

    [owner, buyer] = await ethers.getSigners(); // Get test accounts ...ie ..
    // owner → Signer for account[0] (default deployer) ....buyer → Signer for account[1]
  });

  // 1️⃣ Mint NFT
  it("should mint an NFT", async function () {
    const tokenURI = "ipfs://sample-token-uri";
    const tx = await nftMarketplace.createNFT(tokenURI);
    await tx.wait();

    const uri = await nftMarketplace.tokenURI(1);
    expect(uri).to.equal(tokenURI);
  });

  // 2️⃣ List NFT
  it("should list an NFT", async function () {
    const tokenURI = "ipfs://sample-token-uri";
    await nftMarketplace.createNFT(tokenURI);

    await nftMarketplace.listNFT(1, ethers.parseEther("1"));

    const [price, seller] = await nftMarketplace.getListing(1);
    expect(price).to.equal(ethers.parseEther("1"));
    expect(seller).to.equal(owner.address);
  });

  // 3️⃣ Buy NFT
  it("should allow another user to buy a listed NFT", async function () {
    await nftMarketplace.createNFT("ipfs://sample-uri");
    await nftMarketplace.listNFT(1, ethers.parseEther("1"));

    await nftMarketplace.connect(buyer).buyNFT(1, {
      value: ethers.parseEther("1"),
    });

    expect(await nftMarketplace.ownerOf(1)).to.equal(buyer.address);
  });

  // 4️⃣ Cancel Listing
  it("should allow seller to cancel a listing", async function () {
    await nftMarketplace.createNFT("ipfs://sample-uri");
    await nftMarketplace.listNFT(1, ethers.parseEther("1"));

    await nftMarketplace.cancelListing(1);

    const [price] = await nftMarketplace.getListing(1);
    expect(price).to.equal(0); //price = 0 is how your contract indicates "no active listing"
  });

  // 5️⃣ Withdraw Funds
  it("should allow owner to withdraw funds (marketplace fees)", async function () {
    //const [owner, buyer] = await ethers.getSigners(); did it earlier in beforeEach

    await nftMarketplace.connect(owner).createNFT("ipfs://sample-uri"); //owner means contract deployer 
    await nftMarketplace.connect(owner).listNFT(1, ethers.parseEther("1"));

    // Store owner's initial balance before the buyer buys (and before owner receives seller proceeds)
    const ownerInitialBalance = await ethers.provider.getBalance(owner.address); //owner means contract deployer

    // Buyer buys the NFT. The seller (owner in this case) receives 0.95 ETH here.
    await nftMarketplace.connect(buyer).buyNFT(1, { value: ethers.parseEther("1") });

    // After buyNFT, the contract's balance should be 0.05 ETH (the fee).
    const contractBalanceBeforeWithdraw = await ethers.provider.getBalance(nftMarketplace.target);
    console.log("Contract balance before withdrawal:", ethers.formatEther(contractBalanceBeforeWithdraw));
    expect(contractBalanceBeforeWithdraw).to.equal(ethers.parseEther("0.05"));


    const balanceBeforeWithdrawalCall = await ethers.provider.getBalance(owner.address); // Get balance right before withdrawFunds call
    // if contract deployer is the owner, so we can use owner.address



    ///// Now, the owner calls withdrawFunds to withdraw the marketplace fee.

    const tx = await nftMarketplace.withdrawFunds();
    const receipt = await tx.wait();

    const gasCost = receipt.gasUsed * tx.gasPrice;


// After the withdrawal, the owner's balance should increase by 0.05 ETH (the marketplace fee).
    const balanceAfterWithdrawalCall = await ethers.provider.getBalance(owner.address);

    // The owner should now receive the 0.05 ETH fee.
    // We need to account for the gas spent on the withdrawFunds transaction.
    expect(balanceAfterWithdrawalCall + gasCost).to.be.closeTo(
        balanceBeforeWithdrawalCall + ethers.parseEther("0.05"), // Expecting the 0.05 ETH fee
        ethers.parseEther("0.01") // Tolerance for gas price fluctuations
    );

    // Additionally, confirm the contract balance is now zero
    expect(await ethers.provider.getBalance(nftMarketplace.target)).to.equal(0);
    });
});
