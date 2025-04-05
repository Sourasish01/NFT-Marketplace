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




contract NFTMarketplace is ERC721URIStorage {
    
    uint256 private _tokenId; // _tokenId – Keeps track of the total number of minted NFTs. // initial value is 0.
    uint256 private _itemsSold; // Keeps track of the total number of NFTs sold.

    address payable owner;//The marketplace owner who can modify settings.
    uint256 listingPrice = 0.015 ether;//The fee required to list an NFT.

    mapping(uint256 => MarketItem) private idMarketItem;// A mapping (tokenId → MarketItem struct) that stores NFT details.


    struct MarketItem {
    
        uint256 tokenId;// The unique identifier for the NFT.
        address payable seller;//The original creator or previous owner.
        address payable owner;//Current owner (marketplace or buyer).
        uint256 price;//Sale price of the NFT.
        bool sold;//Whether the NFT has been sold.

    }


    event idMarketItemCreated ( 
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );// event to log the creation of a market item.

    
    
    modifier onlyOwner{ // A modifier in Solidity is like a pre-check rule that a function must pass before executing. It helps reuse code and enforce security checks.

        require(msg.sender == owner, "Only owner can call this function to update the price");
        // this modifier checks if msg.sender (the caller of the function) is the contract owner.
        _;
    }


    constructor() ERC721("NFT Marketplace Token", "MYNFT") { // A constructor in Solidity is a special function that runs only once—when the contract is deployed.
        owner = payable(msg.sender);
    }

    function updateListingPrice(uint256 _listingPrice) public payable onlyOwner{
       listingPrice = _listingPrice;
    }


    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // let create NFT token function 

    function createToken(string memory tokenURI) public payable returns (uint256) { // corrected
        _tokenId++ ; // increment the tokenId //_tokenId keeps track of how many NFTs have been minted.
         //Each time this function is called, _tokenId is increased by 1 to generate a new unique NFT ID.

         uint256 newItemId = _tokenId; // The newItemId stores the newly created token's ID.

        _mint(msg.sender, newItemId); //It creates a new NFT with the newItemId.

        _setTokenURI(newItemId, tokenURI);// It sets the metadata URI for the newly minted NFT.This function associates a tokenURI with the NFT.
        
       // createMarketItem(newItemId, price);// It calls the createMarketItem function to list the NFT for sale on the marketplace.
        return newItemId;// It returns the ID of the newly minted NFT.

    }

    // let create market item function

    function createMarketItem(uint256 tokenId, uint256 price) private { // This function is private, meaning it can only be called within this contract.
        require(ownerOf(tokenId) == msg.sender, "You must own the NFT to list it");// corrected
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        idMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender), //  ms.sender represents the address of the person who called the function.
            payable(address(this)), // The address of the contract itself (the marketplace).
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);

        emit idMarketItemCreated(
            tokenId,
            msg.sender, // seller
            address(this), //owner , the contract address
            price,
            false //sold
        );
    }

    // Function FOR RESALE TOKEN ...will allow the user to resell the NFT

    function reSellToken(uint256 tokenId, uint256 price) public payable {
        require(idMarketItem[tokenId].owner == msg.sender, "Only item owner can perform this operation");
        require(msg.value == listingPrice, "Price must be equal to listing price");
        
        // changes the owner of the NFT to the contract address (the marketplace).
        idMarketItem[tokenId].sold = false;
        idMarketItem[tokenId].price = price;
        idMarketItem[tokenId].seller = payable(msg.sender);
        idMarketItem[tokenId].owner = payable(address(this));

        _itemsSold--; // Decrement the items sold count

        _transfer(msg.sender, address(this), tokenId); // Transfer the NFT from the seller to the marketplace
    }


    // Function FOR MARKET SALE ...will allow the user to buy the NFT

    function createMarketSale(uint256 tokenId) public payable { //alows the user to purchase an NFT listed on the marketplace.
        uint256 price = idMarketItem[tokenId].price; // 

        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        idMarketItem[tokenId].owner = payable(msg.sender);
        idMarketItem[tokenId].sold = true;
       // idMarketItem[tokenId].owner = payable(address(0));
      //  idMarketItem[tokenId].seller.transfer(msg.value);

        _itemsSold++; // Increment the items sold count

        _transfer(address(this), msg.sender, tokenId);// Transfer the NFT from the marketplace to the buyer

        payable(owner).transfer(listingPrice);// Transfer the listing price to the owner of the marketplace

        payable(idMarketItem[tokenId].seller).transfer(msg.value);// Transfer the sale price to the seller
    }

    // Function FOR FETCHING UNSOLD ITEMS ...will allow the user to fetch the unsold items

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenId; // count of all items created
        uint256 unsoldItemCount = _tokenId - _itemsSold; // count of unsold items
        
        uint256 currentIndex = 0; // index to keep track of the current item being processed

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for (uint256 i = 0; i < itemCount; i++) { // loop through all items

            if (idMarketItem[i + 1].owner == address(this)) { // check if the item is unsold ,
            // .owner == address(this) means the NFT is held by the marketplace, so it’s still listed and hasn’t been sold yet.
                
                uint256 currentId = i + 1; // id of the current item that has not been sold

                MarketItem storage currentItem = idMarketItem[currentId]; // stores the  current item, in which the loop is iterating
               
                items[currentIndex] = currentItem; // add the current item to the items array
                currentIndex += 1; // increment the current index in the items array.
            }
        }
        return items;// return the array of unsold items
    }

    // function to purchase item

    function fetchMyNFT() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenId;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i++) { // loops through all items
            if (idMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;
    }

    // Single User NFT item ... will allow the user to fetch the single NFT item

    function fetchMarketItem(uint256 tokenId) public view returns (MarketItem memory) {
    require(idMarketItem[tokenId].tokenId != 0, "Market item does not exist");
    return idMarketItem[tokenId];
}


    /*function fetchMarketItem(uint256 tokenId) public view returns (MarketItem memory) {
        uint256 totalItemCount = _tokenId;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    */



    
}

/**

*/


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


