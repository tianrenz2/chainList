var ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "article 1";
  var articleDescription1 = "Description for article 1";
  var articlePrice1 = 10;

  var articleName2 = "article 2";
  var articleDescription2 = "Description for article 2";
  var articlePrice2 = 15;

  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be initialized with empty values", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return instance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "Number of articles must be zero");
      return chainListInstance.getArticleForSale();
    }).then(function(data) {
      assert.equal(data.length, 0, "There shoudn't be any for sale");
    });
  });

  // sell a first article
    it("should let us sell a first article", function() {
      return ChainList.deployed().then(function(instance){
        chainListInstance = instance;
        return chainListInstance.sellArticle(
          articleName1,
          articleDescription1,
          web3.toWei(articlePrice1, "ether"),
          {from: seller}
        );
      }).then(function(receipt){
        // check event
        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, "sellArticleLog", "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
        assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));

        return chainListInstance.getNumberOfArticles();
      }).then(function(data) {
        assert.equal(data, 1, "number of articles must be one");

        return chainListInstance.getArticleForSale();
      }).then(function(data) {
        assert.equal(data.length, 1, "there must be one article for sale");
        assert.equal(data[0].toNumber(), 1, "article id must be 1");

        return chainListInstance.articles(data[0]);
      }).then(function(data) {
        assert.equal(data[0].toNumber(), 1, "article id must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer must be empty");
        assert.equal(data[3], articleName1, "article name must be " + articleName1);
        assert.equal(data[4], articleDescription1, "article description must be " + articleDescription1);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether"), "article price must be " + web3.toWei(articlePrice1, "ether"));
      });
    });

//Sell second article
  it("Should sell the second article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName2,
        articleDescription2,
        web3.toWei(articlePrice2, "ether"),
        {from: seller}
      );
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "sellArticleLog", "event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "Id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, articleName2, "event article name must be " + articleName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "event article price must be " + web3.toWei(articlePrice2, "ether"));
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data, 2, "number of articles must be 1");
      return chainListInstance.getArticleForSale();
    }).then(function(data){
      assert.equal(data.length, 2, "number of articles must be 1");
      assert.equal(data[1].toNumber(), 2, "article id must be 1");
      return chainListInstance.articles(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "article id must be 2");
      assert.equal(data[1], seller, "seller must be" + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName2, "name must be" + articleName2);
      assert.equal(data[4], articleDescription2, "article description must be" + articleDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether"), "article price must be" + web3.toWei(articlePrice2, "ether"));
    });
  });

  it("should buy the first article", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return chainListInstance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice1, "ether")
      });
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "buyArticleLog", "event should be LogBuyArticle");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "artile id should be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event article price must be " + web3.toWei(articlePrice1, "ether"));

      // record balances of buyer and seller after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effect of buy on balances of buyer and seller, accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");

      return chainListInstance.getArticleForSale();
    }).then(function(data){
      assert.equal(data.length, 1, "Number for sale must be 1");
      assert.equal(data[0].toNumber(), 2, "article 2 must be the only article for sale");
      return chainListInstance.getNumberOfArticles();
    }).then(function(data) {
      assert.equal(data.toNumber(), 2, "should be still 2 articles totlay");
    });
  });



});
