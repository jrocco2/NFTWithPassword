import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { groth16 } from "snarkjs";

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("Example", function () {
  let Verifier;
  let verifier;
  let nft;

  async function deploy() {
    Verifier = await ethers.getContractFactory("ExampleVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
    let NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy();

    return { verifier, Verifier, nft };
  }

  describe("Test", function () {

    it("Should password protect NFT", async function () {
      const { nft } = await loadFixture(deploy);

      const [addr1, addr2] = await ethers.getSigners();

      const password = "4321";
      const input = {
        "preimage": password,
      }

      const { proof, publicSignals } = await groth16.fullProve(input, "circuits/example.wasm", "circuits/example.zkey");

      const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

      const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

      const a = [argv[0], argv[1]];
      const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
      const c = [argv[6], argv[7]];
      const Input = argv.slice(8);

      await nft.mintWithProof(a, b, c, Input[0])

    });
  });

});
