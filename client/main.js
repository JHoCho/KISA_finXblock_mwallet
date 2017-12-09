import {
  Template
} from 'meteor/templating';
import {
  ReactiveVar
} from 'meteor/reactive-var';

import './main.html';

Wallets = new Mongo.Collection('wallets');
Price = new Mongo.Collection('price');
client = new CoinStack('c7dbfacbdf1510889b38c01b8440b1', '10e88e9904f29c98356fd2d12b26de');
client.endpoint = "testchain.blocko.io";
client.protocol = 'http://';

Template.home.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);

  Meteor.subscribe('wallets');
});

Template.home.onCreated(function homeOnCreated() {
  Meteor.subscribe('wallets');
});

Template.walletlist.helpers({
  myWalletlist() {
    return Wallets.find();
  }
});

Template.walletlist.events({
  'click [name="wallet"]' (event, instance) {
    FlowRouter.go('/wallet/' + $(event.currentTarget).attr('data-address'));
  },
});

Template.walletdetail.onCreated(function walletdetailOnCreated() {
  var address = FlowRouter.getParam('walletAdderss');
  Meteor.subscribe('mywallet', address);
  Meteor.subscribe('price');
});

Template.walletdetail.rendered = function () {
  if (!this.qrloaded) {
    this.qrloaded = true;

    var address = FlowRouter.getParam('walletAdderss');
    console.log("주소"+address);
    var param = {
      address: address
    };

    Meteor.call('getBalance', address, function (err, res) {
      if (!err) {
        Session.set(address + 'balance', res);
        console.log("test"+res);
      }
    });

    qrContents = "bitcoin:" + address;
    var qrcodesvg = new Qrcodesvg(qrContents, "qrcode", 250, {
      "ecclevel": 1
    });
    qrcodesvg.draw({
      "method": "classic",
      "fill-colors": ["#003658", "#0085CB", "#0085CB"]
    }, {
      "stroke-width": 1
    });
  }
}

Template.walletdetail.helpers({
  walletaddress() {
    return FlowRouter.getParam('walletAdderss');
  },
  mywallet() {
    return Wallets.findOne();
  },
  mywalletbalance() {
    var address = FlowRouter.getParam('walletAdderss');
    return Session.get(address + 'balance');
  },
  bitcoinprice() {
    return Price.findOne({_id:'btc_bithumb'}).price;
  }
});
Template.walletdetail.events({
  'submit form': function(event){ 
    event.preventDefault(); 
    var bitcoin = event.target.text.value;
    var addr = event.target.addr.value;
    var params = {
      address : addr,
      bitcoin : bitcoin
    };
    Meteor.call("addTask", params);
    event.target.text.value = "";
    event.target.addr.value = "";
 },
});
 
//  "click button" (event) {
//    console.log("test");
//    addr = event.target.addr.value;
//    // var friendAddress = '';
//    var params = {
//      address : addr,
//      bitcoin : bitcoin
//    };
//    Meteor.call("addTask", param);
//    console.log("들어가는가");
