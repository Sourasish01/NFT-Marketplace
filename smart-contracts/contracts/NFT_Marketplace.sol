// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";
//is used to import Hardhat’s built-in debugging tool, console.log, which allows you to print debug messages while testing and deploying your smart contracts.
//console.sol only works in Hardhat (not in production or testnets).It increases gas consumption (but it’s fine for debugging locally).
//Remove it before deploying to production.



import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // The ERC721.sol contract is the foundation for non-fungible tokens (NFTs) in Ethereum.
// It defines the ERC-721 standard, which provides functions for creating, transferring, and managing NFTs.

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// The ERC721URIStorage.sol contract extends the ERC721 standard to include a URI storage mechanism.
// This allows you to associate a unique URI (Uniform Resource Identifier) with each NFT, which can point to metadata or other resources related to the token.
//By default, ERC721.sol does not store metadata (like name, image, or description) for NFTs.
//ERC721URIStorage.sol adds a _tokenURIs mapping to store metadata on-chain.

import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    uint256 private nextTokenId = 1;

    struct NFTListing { // struct is a way to define a custom data type in Solidity.
        uint256 price;
        address seller;
    }
   
    mapping(uint256 => NFTListing) private listings; // A mapping is a key-value store in Solidity 
    // This mapping is private, meaning it can only be accessed within this contract.

    event NFTTransfer( 
        uint256 tokenId,
        address from,
        address to,
        string tokenURI,
        uint256 price
    );

    // A constructor in Solidity is a special function that runs only once—when the contract is deployed. 
    constructor() ERC721("NFT Marketplace Token", "MYNFT") Ownable(msg.sender) {} //Ownable is a contract from OpenZeppelin that allows you to set an owner for the contract ie who deploys it ..as a result the person that triggered the constructor ...ie msg.sender ,
    // who can perform privileged actions like withdrawing funds or changing settings.

    function createNFT(string calldata tokenURI) external { // #3>> this function is external, meaning it can be called by anyone outside the contract.
        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _mint(msg.sender, tokenId); //Mint the NFT to the sender’s wallet..ie the caller of the function. This line mints (creates) the NFT and assigns its ownership to the caller of the function, which is msg.sender.
        _setTokenURI(tokenId, tokenURI);//Store the metadata storage link at nftstorage ..to the NFT.

        emit NFTTransfer(tokenId, address(0), msg.sender, tokenURI, 0);//event: from = address(0) = minting done....to = msg.sender....price = 0 = not listed.
    }

    function listNFT(uint256 tokenId, uint256 price) external { // #3>>
        require(ownerOf(tokenId) == msg.sender, "Not the token owner"); // Checks if the caller is the owner of the NFT
        require(price > 0, "Price must be greater than zero"); // Ensures the price input for listing is greater than zero ..before we apply the listing.

        _transfer(msg.sender, address(this), tokenId); //# 4>>✅ The NFT is now in the custody of the NFTMarketplace smart contract itself — not the marketplace owner.
        // This line transfers the NFT from the owner (msg.sender) to the contract itself, effectively putting it up for sale.

        listings[tokenId] = NFTListing(price, msg.sender); //after the transfer, we create a new NFTListing struct and store it in the listings mapping.

        emit NFTTransfer(tokenId, msg.sender, address(this), "", price); //event: from = msg.sender....to = address(this)....price != 0 listed.
    }


    function buyNFT(uint256 tokenId) external payable { //#3>> 
    //payable allows the function to accept Ether as payment from the transaction of the buyer using msg.value.
    //The function must be marked payable to accept and use msg.value
    //msg : A global object with info about the current function call

        NFTListing memory listing = listings[tokenId]; // #5>> Retrieves the listing details for the specified tokenId from the listings mapping.
        
        
        require(listing.price > 0, "NFT not listed for sale"); // Checks if the NFT is listed for sale by verifying that the price is greater than zero.
        require(msg.value == listing.price, "Incorrect payment amount"); // Ensures the buyer is sending the exact listing price.

        delete listings[tokenId];// Removes the listing from the mapping, indicating that the NFT is no longer for sale.

        // Transfer 95% to the seller
        uint256 sellerAmount = (msg.value * 95) / 100; // Calculate 95% of the payment amount to be sent to the seller.
        payable(listing.seller).transfer(sellerAmount); // #6>> Transfers 95% of the payment to the seller’s address.

        // Transfer NFT to buyer
        _transfer(address(this), msg.sender, tokenId); // after the payment is made to the seller
        // The NFT is transferred from the contract (address(this)) to the buyer (msg.sender). ..
        // msg sender is the buyer who called the buyNFT function.

        emit NFTTransfer(tokenId, address(this), msg.sender, "", 0); 
        // Emits an event to log the transfer of the NFT, indicating that it has been transferred from the contract to the buyer.
        // from = address(this) = the contract itself (the marketplace)....to = msg.sender = the buyer .. price: 0 ➝ because the NFT is no longer listed
    }

    function cancelListing(uint256 tokenId) external { //#3>>
        NFTListing memory listing = listings[tokenId];// #5>>

        require(listing.price > 0, "NFT not listed"); // Checks if the NFT is listed for sale by verifying that the price is greater than zero.
        require(listing.seller == msg.sender, "You're not the seller"); // Ensures that only the seller can cancel the listing.

        delete listings[tokenId]; // Removes the listing from the mapping, indicating that the NFT is no longer for sale.

        _transfer(address(this), msg.sender, tokenId);
        // Transfers the NFT back to the seller (msg.sender) from the contract (address(this)). 

        emit NFTTransfer(tokenId, address(this), msg.sender, "", 0);
        // Emits an event to log the transfer of the NFT back to the seller, indicating that it has been transferred from the contract to the seller.
    }

    function withdrawFunds() external onlyOwner {// # 3>>external: Only callable from outside the contract.
        //onlyOwner: Ensures that only the contract owner can call this function (uses Ownable from OpenZeppelin).

        uint256 balance = address(this).balance; // Retrieves the balance of the contract, which is the total Ether held by the NFTMarketplace contract.
        // This balance includes funds from NFT sales and listing fees.
        require(balance > 0, "No balance to withdraw");// Ensures that there is a positive balance to withdraw.

        payable(owner()).transfer(balance);// Transfers the entire balance of the contract to the owner’s address.
    }

    function getListing(uint256 tokenId) external view returns (uint256, address) {//#3>>
    //view: It only reads data, doesn’t change anything.
        NFTListing memory listing = listings[tokenId]; // retrieves the listing details for the specified tokenId from the listings mapping.
        return (listing.price, listing.seller);// Returns the price and seller address of the NFT listing.
    }
}



/*

3>>
 Yes, ✅ you could use public instead of external Yes, ✅ you could use public instead of external — and the function would still work the same in this case. But here’s the difference and why external is better here:Yes, ✅ you could use public instead of external — and the function would still work the same in this case. But here’s the difference and why external is better here:Yes, ✅ you could use public instead of external — and the function would still work the same in this case. But here’s the difference and why external is better here: and the function would still work the same in this case. But here’s the difference and why external is better here:
🔍 external vs public in Solidity

Who can call it:

public: Anyone (external and internal)
external: Only from outside (transactions or other contracts)

Can be called internally:

public: ✅ Yes (can call directly within the contract)
external: ❌ No (must use this.functionName() to call internally)

Gas cost:

public: Higher (copies arguments from calldata to memory)
external: Lower (reads directly from calldata)

Best suited for:

public: Functions used both internally and externally
external: Functions meant to be called only externally (e.g. from frontend or other contracts)


4>>

Why it's done:
Prevents the seller from transferring/selling the NFT elsewhere while it's listed.

Ensures the buyer will receive the NFT immediately and securely upon purchase..
// cannot trust the marketplace owner to transfer the NFT to the buyer after payment, as code cannot be changed after deployment, so the NFT is now in the custody of the NFTMarketplace smart contract itself — not the marketplace owner.


5>>

// this listing variable is a temporary copy of the NFTListing struct stored in the listings mapping ..as stored in memory.
//if dont use the memory keyword, it will be stored in storage, which is more expensive in terms of gas.
// if we use the listings in storage it may change the data off the mapping stored in storage in blockchain.
// so we use memory to create a temporary copy of the listing in memory, which is cheaper(gas cost) and safer, so that we can read the data without modifying the original listing in storage.
// This ensures that we can safely access the listing details without worrying about unintended changes.

6>>

listing.seller :
This is the address of the user who originally listed the NFT for sale.

payable(...) :
In Solidity, to send ETH to an address, the address must be marked as payable.
listing.seller is just an address, so we convert it into a payable address using payable(...).

.transfer(sellerAmount):
This sends the specified amount of Ether (in wei) to the payable address.
It automatically reverts if the transfer fails.



/**

An event in Solidity is a way for a smart contract to log information on the blockchain.
Events do not store data but allow external applications (like DApps) to track changes.

Think of events as notifications that smart contracts send out when something important happens.
💡 Example: "A new NFT has been created!"

Events are defined using the event keyword, and they can be emitted using the emit keyword.


📌 How Events Work?
📌 1️⃣ Declaring an Event
Just like defining a function, we declare an event first:


event idMarketItemCreated (
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
);
📌 2️⃣ Emitting an Event
When an NFT is created, we trigger (emit) the event:


emit idMarketItemCreated(
    tokenId,         // NFT ID
    msg.sender,      // Seller's address
    address(this),   // Contract owns the NFT initially
    price,           // Listing price
    false            // Not sold yet
);
🔹 The emit keyword logs the event on the blockchain.
🔹 External apps (like marketplaces) can track this event.


What Does This Event Do?
Your event:

s
event idMarketItemCreated (
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
);
✅ What does this mean?
When a new NFT is listed for sale, this event logs the details on the blockchain.

✅ Why use events?

DApps can listen to events and update the UI in real-time.

Cheaper than storing data on-chain (saving gas fees).

Helps developers debug smart contracts.

📌 Breaking Down the Event
Parameter	Type	Meaning
uint256     indexed tokenId	   uint256	The NFT’s unique ID (Indexed for search).
address     seller	address	   The wallet address of the seller.
address     owner	address	   The current owner of the NFT (Initially the contract).
uint256     price	uint256	   The NFT’s price in Wei.
bool sold	bool	Whether    the NFT is sold (true/false).

📌 How is the Event Used?
In Solidity, events are emitted to log information.

For example, when an NFT is listed:


emit idMarketItemCreated(
    tokenId,         // Unique ID of the NFT
    msg.sender,      // Seller's wallet address
    address(this),   // Contract initially owns it
    price,           // NFT price
    false            // Not sold yet
);
🚀 This action triggers an event, making it visible on the blockchain!

 */




