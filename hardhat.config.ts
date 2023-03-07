import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-circom";
import "hardhat-gas-reporter"

task("bump", "Bumps solidity version of circom contracts")
  .addParam("contract", "The contract to bump")
  .setAction(async (taskArgs) => {
    const fs = require("fs");
    const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/
    const verifierRegex = /contract Verifier/

    let content = fs.readFileSync(`./contracts/${taskArgs.contract}.sol`, { encoding: 'utf-8' });
    let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
    bumped = bumped.replace(verifierRegex, `contract ${taskArgs.contract}`);
    
    fs.writeFileSync(`./contracts/${taskArgs.contract}.sol`, bumped);
  });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  } ,
  circom: {
    // (optional) Base path for input files, defaults to `./circuits/`
    inputBasePath: "./circuits",
    // (required) The final ptau file, relative to inputBasePath, from a Phase 1 ceremony
    ptau: "powersOfTau28_hez_final_10.ptau",
    // (required) Each object in this array refers to a separate circuit
    circuits: [{ name: "example" }, { name: "hasher" }],
  },
  gasReporter: {
    enabled: true
  }
};

export default config;
