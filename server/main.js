import {
  Meteor
} from 'meteor/meteor';
import {
  Mongo
} from 'meteor/mongo';
import {
  HTTP
} from 'meteor/http'
var CryptoJS = require("crypto-js");

client = new CoinStack('c7dbfacbdf1510889b38c01b8440b1', '10e88e9904f29c98356fd2d12b26de');
client.endpoint = "testchain.blocko.io";
client.protocol = 'http://';

Wallets = new Mongo.Collection('wallets');
Price = new Mongo.Collection('price');

Meteor.startup(() => {
  //console.log(ciphertext);

  var walletsCnt = Wallets.find().count();

  var privateKey = CoinStack.ECKey.createKey();
  var address = CoinStack.ECKey.deriveAddress(privateKey);

  if (walletsCnt == 0) {
    var documnet = {
      _id: address,
      privateKey: privateKey,
      createAt: new Date()
    };
    Wallets.insert(documnet);
    console.log('insert wallet');
  } else {
    console.log('ended');
  }

  Meteor.setInterval(function () {
    console.log('timer');
    HTTP.get('https://api.bithumb.com/public/ticker', {}, function (err, data) {
      if (err) {
        console.log('으악 에러남');
        return false;
      }

      var btc_price = data.data.data.closing_price;
      console.log(btc_price);
      Price.upsert({
        _id: 'btc_bithumb'
      }, {
          price: btc_price
        });
    });
  }, 100000);
});

Meteor.methods({
  getBalance: function (address) {
    console.log('check balance: ' + address);
    var balance = CoinStack.Math.toBitcoin(client.getBalanceSync(address));
    console.log('check balance: ' + balance);
    return balance;
 },
 getTxHistory: function (address) {
  console.log('check balance: ' + address);
  client.getTransactionsSync(address);
  //console.log('check balance: ' + balance);
  return balance;
},

// TO-DO 
// transactionBitcoin


});
