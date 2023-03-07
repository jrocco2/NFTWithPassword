# Circom Starter Kit

## Define Circuit
1. Build a circuit in `circuits/example.circom` 
2. Define a sample input in `circuits/example.json`
3. Compile the circuit with 
```shell 
npx hardhat circom
```

## Upgrade the Verifier Smart Contract
1. Update the `ExampleVerifier.sol` contract to a new version of solidity by doing 

```shell 
npx hardhat bump --contract ExampleVerifier
```

## Test your circuit

```shell
npx hardhat test
```

### Notes
For more information on compiling circuits see [hardhat-circom](https://www.npmjs.com/package/hardhat-circom).