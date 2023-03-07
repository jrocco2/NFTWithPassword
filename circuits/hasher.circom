pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/poseidon.circom";

template Hasher() {
    signal input preimage;
    signal output hash;
    // Hash the preimage and check if the result matches the hash.
    component hasher = Poseidon(1);
    hasher.inputs[0] <== preimage;

    hash <== hasher.out;
}

component main = Hasher();
