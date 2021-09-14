jQuery(onLoad);

var ajaxPrefix = "bridge.php?";


var sendFrom;
var sendTo;
var iAmt;
var xprv;
var sendFee;

function onLoad() {


    var action = null;
    var data = null;

    try {
        const params = new URL(location).searchParams;
        var action = params.get('action');
        var data = params.get('data'); 
    }
    catch(err) {}

    if (action == null) action = "";
    if (data == null) data = "";

    linkAction = action;
    linkData = data;

    if (action == "gen_hdseed")
        generateSeed ( data );

    else if (action == "send_coins")
        sendCoins ( data );



}


function generateSeed (  randomSeed ) {

    var finalHash = CryptoJS.SHA256( randomSeed );            

    var hexFinalHash = "";
    for ( var i = 0; i < 4; i++) {
        var hexStr = Math.abs(finalHash.words[i]).toString(16);
        while (hexStr.length < 8)
            hexStr = '0' + hexStr;
        hexFinalHash += hexStr;
    }    

    const mnemonic = DynWallet.bip39.entropyToMnemonic(hexFinalHash);


    var masterSeed = DynWallet.bip39.mnemonicToSeedSync(mnemonic);


    var node = DynWallet.bip32.fromSeed(masterSeed);


    var xprv = node.toBase58();

    var seedWords = mnemonic.split (" ");    


    var network = DynWallet.bitcoin.networks.bitcoin;
    var root = DynWallet.bip32.fromBase58(xprv, network);

    var child = root.derivePath("m/0'/0'/0'");
    var script = DynWallet.bitcoin.payments.p2wpkh( {pubkey: child.publicKey, network});
    var addr = script.address;    

    document.getElementById("data1").innerHTML = "$"+mnemonic+" ~"+xprv+"~"+addr+"~$";

}


function sendCoins ( strParams ) {

    var params = strParams.split("~");

    sendFrom = params[0];
    sendTo = params[1];
    var amt = params[2];
    xprv = params[3];
    sendFee = 10000;

    var strAmt = parseDecimal(amt);
    iAmt = parseInt(strAmt);

    var request = ajaxPrefix + "get_utxo?addr=" + sendFrom + "&amount=" + (iAmt + sendFee);

    $.ajax(
        {url: request, success: function(result) {
            
            var utxoSet = [];
            var lines = result.split("\n");
            for ( var i = 0; i < lines.length; i++) {
                var element = lines[i].split(",");
                if (element.length == 3) {
                    var utxo = new Object();
                    utxo.txID = element[0];
                    utxo.vout = parseInt (element[1]);
                    utxo.amount = parseInt (element[2]);
                    utxoSet.push(utxo);
                }
            }

            try {
                createTransaction ( sendTo, iAmt, sendFee, utxoSet);
            }
            catch (ex) {
                document.getElementById("data1").innerHTML = "$" + ex + "$";

            }

        }}
    ); 


}



function createTransaction ( destAddr, amount, fee, utxoSet  ) {

    var addrPath = "m/0'/0'/0'";

    var network = DynWallet.bitcoin.networks.bitcoin;

    var dest = DynWallet.bech32.bech32.decode(destAddr);

    if (xprv.startsWith("xprv")) {

        var root = DynWallet.bip32.fromBase58(xprv, network);
        var child = root.derivePath(addrPath);
        const ecpair = DynWallet.bitcoin.ECPair.fromPublicKey(child.publicKey, { network: network });
        const p2wpkh = DynWallet.bitcoin.payments.p2wpkh({ pubkey: ecpair.publicKey, network: network });

        var psbt = new DynWallet.bitcoin.Psbt();

        psbt.addOutput ( {address: destAddr, value : amount});

        var totalAmt = 0;
        for ( var i = 0; i < utxoSet.length; i++ ) 
            totalAmt += utxoSet[i].amount;

        var changeAmt = totalAmt - amount - fee;
        var changeAddr = sendFrom;

        if (changeAmt > 0)
            psbt.addOutput ( {address: changeAddr, value : changeAmt});


        
        for ( var i = 0; i < utxoSet.length; i++ ) {
            psbt.addInput ( {
                hash: utxoSet[i].txID,
                index: utxoSet[i].vout,
                witnessUtxo: {
                script: p2wpkh.output,
                value: utxoSet[i].amount,
                }
            } );        
        }

        for ( var i = 0; i < utxoSet.length; i++ ) {
            psbt.signInput(i, child);
            psbt.validateSignaturesOfInput(i, child.publicKey);
        }


        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction();
        var strHexTransaction = tx.toHex();
        var len = strHexTransaction.length;

        var request = ajaxPrefix + "send_tx";

        $.ajax(
            {url: request, 
            method: "POST",
            data : {
                transaction: strHexTransaction
            },
            success: function(result) {
                if (result.length == 64) {
                    document.getElementById("data1").innerHTML = "$" + result + "$";
                }
                else {
                    document.getElementById("data1").innerHTML = "$" + result + "$";
                }

            }}
        );
    

    }
}


function parseDecimal ( data ) {

    var intPart = "";
    var decPart = "";

    if (data.charAt(0) == ".")
        data = "0" + data;

    if (data.indexOf(".") == -1) {
        intPart = data;
        decPart = "00000000";
    }
    else {
        intPart = data.substring(0, data.indexOf("."));
        decPart = data.substring(data.indexOf(".")+1);
        while (decPart.length < 8)
            decPart = decPart + "0";
    }

    return intPart + decPart;
}