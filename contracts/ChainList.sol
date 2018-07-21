pragma solidity ^0.4.18;

import "./Ownable.sol";

contract ChainList is Ownable {
  // state variables
  struct Article{
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  mapping (uint => Article) public articles;
  uint articleCounter;



  // events
  event sellArticleLog(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
  );
  event buyArticleLog(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
  );

  //deactivate contract
  function kill() public onlyOwner{
    selfdestruct(owner);
  }

  // sell an article
  function sellArticle(string _name, string _description, uint256 _price) public {
    articleCounter++;

    articles[articleCounter] = Article(
      articleCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price
    );

    sellArticleLog(articleCounter, msg.sender, _name, _price);
  }


  function getNumberOfArticles() public view returns(uint){
    return articleCounter;
  }

  function getArticleForSale() public view returns(uint[]){
    uint[] memory articleIds = new uint[](articleCounter);

    uint numberOfArticlesForSale = 0;

    for(uint i = 1; i<= articleCounter; i++){
      if(articles[i].buyer == 0x0){
        articleIds[numberOfArticlesForSale] = articles[i].id;
        numberOfArticlesForSale++;
      }
    }

    uint[] memory forSale = new uint[](numberOfArticlesForSale);
    for(uint j = 0; j<numberOfArticlesForSale; j++){
      forSale[j] = articleIds[j];
    }

    return forSale;
  }

  // buy an article
  function buyArticle(uint _id) payable public {

    require(articleCounter>0);
    require(_id > 0 && _id <= articleCounter);

    Article storage article = articles[_id];
    // we check whether there is an article for sale
    require(article.seller != 0x0);

    // we check that the article has not been sold yet
    require(article.buyer == 0X0);

    // we don't allow the seller to buy his own article
    require(msg.sender != article.seller);

    // we check that the value sent corresponds to the price of the article
    require(msg.value == article.price);

    // keep buyer's information
    article.buyer = msg.sender;

    // the buyer can pay the seller
    article.seller.transfer(msg.value);

    // trigger the event
    buyArticleLog(_id, article.seller, article.buyer, article.name, article.price);
  }
}
