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
var address= "1AMFa3eNQ1nAv7Ufnc6AugB3D8xzXhN3Ek";
var privateKey ="KzDEX5tYQX7r8yW5qQixhJeEPG7HHwg4hp6mG8PY9guiGFD95YBC";

client = new CoinStack('c7dbfacbdf1510889b38c01b8440b1', '10e88e9904f29c98356fd2d12b26de');
client.endpoint = "testchain.blocko.io";
client.protocol = 'http://';

Wallets = new Mongo.Collection('wallets');
Price = new Mongo.Collection('price');

Meteor.startup(() => {
  //console.log(ciphertext);
  
  var walletsCnt = Wallets.find().count();
  var balance = CoinStack.Math.toBitcoin(client.getBalanceSync(address));
  console.log('my balance: ' + balance);
 // var privateKey = CoinStack.ECKey.createKey();
 // var address = CoinStack.ECKey.deriveAddress(privateKey);

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
  getBalance: function (param) {
    var balance = CoinStack.Math.toBitcoin(client.getBalanceSync(address));
    
    console.log('check balance: ' + balance);
    return balance;
    // client.getBalance(fromaddress, 
    //   function(err, balance) { 
    //   console.log(CoinStack.Math.toBitcoin(balance) + 'BTC'); 
    //   });
 },
 getTxHistory: function (address) {
  console.log('check balance: ' + address);
  client.getTransactionsSync(address);
  //console.log('check balance: ' + balance);
  return balance;
},

// TO-DO 
// transactionBitcoin
addTask:function(param){
// server 트랜잭션 생성만 하는 코드.
console.log("test1");
console.log('check address: ' + param.address);
console.log('send bitcoin: '+param.bitcoin);

if(param.address!=null){
  toAddress =param.address;
};
var txBuilder = client.createTransactionBuilder();
    txBuilder.addOutput(toAddress, CoinStack.Math.toSatoshi(param.bitcoin));
    txBuilder.setInput(address);
    txBuilder.setFee(CoinStack.Math.toSatoshi("0.0001"));
    console.log("test");
    var tx = client.buildTransactionSync(txBuilder);
    tx.sign(privateKey);
    var rawSignedTx = tx.serialize();
    console.log(rawSignedTx);
    //트랜잭션 전송
    try {
      // send tx
      client.sendTransactionSync(rawSignedTx);
      console.log(toAddress+"로 전송 성공");
    } catch (e) {
      console.log("failed to send tx");
  }
},
});
