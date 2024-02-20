// Import Solana web3 functionalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

    // Generate a new keypair
const from = Keypair.generate();
console.log(from.publicKey.toString());
console.log(from.secretKey);
// Generate another Keypair (account we'll be sending to)
const to = Keypair.generate();
console.log(to.publicKey.toString());
console.log(to.secretKey);

let solBalance;

const getWalletBalance = async (publicKey, recepient) => {
    try {
        // Get balance of the user provided wallet address new PublicKey(publicKey)
        const walletBalance = await connection.getBalance(new PublicKey(publicKey));
        solBalance = parseInt(walletBalance) / LAMPORTS_PER_SOL;            
        console.log(`${recepient} Wallet balance: ${solBalance} SOL`);

    } catch (err) {
        console.log(err);
    }
};

const airDropSol = async () => {
    getWalletBalance(from.publicKey.toString(),"BEFORE AIRDROP to");
    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );    
    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });
    
    console.log("Airdrop completed for the Sender account");
    getWalletBalance(from.publicKey.toString(),"AFTER AIDROP to");
}

const transferSol = async() => {
    const walletBalance = await connection.getBalance(new PublicKey(from.publicKey));
    const amountToSend = walletBalance * 0.5;
    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: amountToSend
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is', signature);
}


airDropSol().then(async () => {
    await getWalletBalance(from.publicKey,"before send from");
    await getWalletBalance(to.publicKey,"before send to");
    await transferSol();
    await getWalletBalance(from.publicKey,"after send from");
    await getWalletBalance(to.publicKey,"after send to");
});



// getWalletBalance(to.publicKey.toString(),"from");   


// console.log('    ------------SENDING SOL------------');
// transferSol();

// console.log(LAMPORTS_PER_SOL);
// getWalletBalance("5SmG3kW6uxhmnqbWnUjW4N15eT4fYd2m7bhQZiNDazQY",new Connection("http://127.0.0.1:8899", "confirmed"));