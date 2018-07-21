var ChainList = artifacts.require("./ChainList.sol");

contract("ChainList", function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1";
  var articleDescription = "Des for article 1";
  var articlePrice = 10;

  it("should throw an exception if you are buying a non-existing article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle({
        from: buyer,
        value: web3.toWei(articlePrice, "ether")
      });
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function(){
      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(), 0, "number of articles must be 0");
    });
  });

  //Buy an nonexsisting article

  it("should throw an exception if you are buying a non-existing article", function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(
        articleName,
        articleDescription,
        web3.toWei(articlePrice, "ether"),
        {from: seller});
      }).then(function(receipt){
        return chainListInstance.buyArticle(2, {from: seller, value: web3.toWei(articlePrice, "ether")});
      }).then(assert.fail)
      .catch(function error(){
        assert(true);
      }).then(function(){
        return chainListInstance.articles(1);
      }).then(function(data){
        assert.equal(data[0].toNumber(),1, "article id must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer must be empty");
        assert.equal(data[3], articleName, "article name must be " + articleName);
        assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
      });
  });

  it("should throw an exception if you are buying your own article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle({from: seller, value: web3.toWei(articlePrice,"ether")});
      }).then(assert.fail)
      .catch(function(error){
        assert(true);
      }).then(function(){
        return chainListInstance.articles(1);
      }).then(function(data){
        assert.equal(data[0].toNumber(), 1, "seller must be 1");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer must be empty");
        assert.equal(data[3], articleName, "article name must be "+ articleName);
        assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
        assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be "+ web3.toWei(articlePrice, "ether"));
      });
    });


  it("should throw an exception if you are buy an article with a different price", function(){
    ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice + 1, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true)
    }).then(function(){
      return chainListInstance.getArticle();
    }).then(function(data){
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], 0x0, "buyer must be empty");
      assert.equal(data[2], articleName, "article name must be empty");
      assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be "+ web3.toWei(articlePrice, "ether"));
    });
  });

  it("should throw an exception if you are buy an article that has been sold", function(){
    ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")});
    }).then(function(){
      return chainListInstance.buyArticle({from: buyer, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true)
    }).then(function(){
      return chainListInstance.getArticle();
    }).then(function(data){
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], buyer, "buyer must be " + buyer);
      assert.equal(data[2], articleName, "article name must be "+ articleName);
      assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be "+ web3.toWei(articlePrice, "ether"));
    });
  });

});
