App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }

    ethereum.enable()

    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Charity.json", function(charity) {
      App.contracts.Charity = TruffleContract(charity);
      App.contracts.Charity.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  listenForEvents: function() {
    App.contracts.Charity.deployed().then(function(instance) {


      instance.donatedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)

        console.log(3)
        App.render();
      });
    });
  },

  render: function() {
    var charityInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.contracts.Charity.deployed().then(function(instance) {
      charityInstance = instance;
      window.instance = instance;
       instance.getTokens({ from: App.account }).then( (balance)=> {
        instance.symbol({ from: App.account }).then((symbol) => {      
          $("#tokenBalance").html(`${balance / 10**18} ${symbol}`);
          $("#userBalance").html(`${balance / 10**18} ${symbol}`);
        })
      });
      return charityInstance.charityCount({ from: App.account });
    }).then(function(charityCount) {
      var charityResults = $("#charityResults");
      charityResults.empty();

      var charitySelect = $('#charitySelect');
      charitySelect.empty();
      
      charityInstance.isOwnerContract( { from: App.account }).then((isOwner)=> {
        isOwner ?  $("#sayThanks").show() :  $("#sayThanks").hide() 
        console.log(isOwner)
      })
      charityInstance.isOwnerContract( { from: App.account }).then((isOwner)=> {
        isOwner ?  $("#isUser").hide() :  $("#isUser").show() 
        console.log(isOwner)
      })
      charityInstance.isOwnerContract( { from: App.account }).then((isOwner)=> {
        isOwner ?  $("#showrewards").hide() :  $("#showrewards").show() 
        console.log(isOwner)
      })

      for (var i = 1; i <= charityCount; i++) {
        charityInstance.charities(i).then(function(charity_info) {
          var id = charity_info[0];
          var name = charity_info[1];
          var totalDonations = charity_info[2];
          var charityAddress = charity_info[3];

          var charityTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + charityAddress + "</td><td>" + totalDonations + "</td></tr>"
          charityResults.append(charityTemplate);

          var charityOption = "<option value='" + id + "' >" + name + "</ option>"
          charitySelect.append(charityOption);
        });
      }
      return charityInstance.users(App.account);
    }).then(function(hasDonated) {
      if(hasDonated) {
        // $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },
  sayThanks: function() {
    var charityId = $('#charitySelect').val();
    App.contracts.Charity.deployed().then(function(instance) {
      return instance.sayThanksToDonar(charityId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      // alert(err)
      console.error(err);
    });
  },

  doDonate: function() {
    var charityId = $('#charitySelect').val();
    var getcharitymoney = $('#getmoney').val();
    App.contracts.Charity.deployed().then(function(instance) {
      return instance.donate(charityId,getcharitymoney, App.account, { from: App.account });
    }).then(function(result) {
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
