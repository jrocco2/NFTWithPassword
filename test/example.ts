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

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {

      const circuit = await wasm_tester("circuits/example.circom");

      const input = {
        "hash": "11073944447358252977412171491011187728107721062193052377268397448625136347320",
        "preimage": "4321",
        "address": "0x9b591bf6970D271c4660Df5E08d85773E998B59E"
      }

      // Calculate the witness
      const witness = await circuit.calculateWitness(input, true);
      // console.log(witness)

      // expect(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
      // expect(Fr.eq(Fr.e(witness[1]), Fr.e(1)));
    });

    it("Should return true for correct proof", async function () {
      const { verifier } = await loadFixture(deploy);


      const input = {
        "hash": "11073944447358252977412171491011187728107721062193052377268397448625136347320",
        "preimage": "4321",
        "address": "0x9b591bf6970D271c4660Df5E08d85773E998B59E"
      }

      const { proof, publicSignals } = await groth16.fullProve(input, "circuits/example.wasm", "circuits/example.zkey");

      const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

      const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

      const a = [argv[0], argv[1]];
      const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
      const c = [argv[6], argv[7]];
      const Input = argv.slice(8);

      console.log("Verification Gas Costs: ", await verifier.estimateGas.verifyProof(a, b, c, Input))
      expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    it("Should password protect NFT", async function () {
      const { nft } = await loadFixture(deploy);

      const [addr1, addr2] = await ethers.getSigners();

      const password = "4321";
      const input = {
        "hash": (await nft.hash()).toString(),
        "preimage": password,
        "address": addr1.address
      }

      const { proof, publicSignals } = await groth16.fullProve(input, "circuits/example.wasm", "circuits/example.zkey");

      const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

      const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

      const a = [argv[0], argv[1]];
      const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
      const c = [argv[6], argv[7]];
      const Input = argv.slice(8);

      console.log("Total Mint Cost: ", await nft.estimateGas.mintWithProof(a, b, c, Input[0]))
      await nft.mintWithProof(a, b, c, Input[0])

    });
    it("Should fail with wrong password", async function () {
      const { nft } = await loadFixture(deploy);

      const [addr1, addr2] = await ethers.getSigners();

      const password = "1234";
      const input = {
        "hash": (await nft.hash()).toString(),
        "preimage": password,
        "address": addr1.address
      }

      await expect(
        groth16.fullProve(input, "circuits/example.wasm", "circuits/example.zkey")
      ).to.throw

    });

    it("Should not allow the same proof twice", async function () {
      const { nft } = await loadFixture(deploy);

      const [addr1, addr2] = await ethers.getSigners();

      const password = "4321";
      const input = {
        "hash": (await nft.hash()).toString(),
        "preimage": password,
        "address": addr1.address
      }

      const { proof, publicSignals } = await groth16.fullProve(input, "circuits/example.wasm", "circuits/example.zkey");

      const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

      const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

      const a = [argv[0], argv[1]];
      const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
      const c = [argv[6], argv[7]];
      const Input = argv.slice(8);

      console.log("Total Mint Cost: ", await nft.estimateGas.mintWithProof(a, b, c, Input[0]))
      await nft.mintWithProof(a, b, c, Input[0])
      await expect(nft.mintWithProof(a, b, c, Input[0])).to.be.reverted

    });

  });

});
