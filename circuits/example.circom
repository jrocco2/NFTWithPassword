pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/poseidon.circom";

// Problems:
// 1 - Other users can copy
// 2 - User can only use their password once
// 3 - Contract admin cant update password without redploying a new ZK snark
template NftMint() {

    signal input password; // Private
    signal output success; // Public Return Value

    // The hash of 1234
    signal hash <== 11073944447358252977412171491011187728107721062193052377268397448625136347320;

    // Hash the password and check if the result matches the hash.
    component hasher = Poseidon(1);
    hasher.inputs[0] <== password;
    hasher.out === hash;
    
    success <== 1;
}

component main = NftMint();
