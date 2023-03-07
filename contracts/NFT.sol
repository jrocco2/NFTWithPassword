// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ExampleVerifier } from "./ExampleVerifier.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721, ExampleVerifier {
    
    uint256 public hash = uint256(11073944447358252977412171491011187728107721062193052377268397448625136347320);
    uint256 public nextTokenId;

    mapping (uint256 => bool) public nullifiers;

    constructor() ERC721("ZkNft", "ZK") {}

    function mintWithProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint256 _nullifier
    )
    public
    {
        require(
            nullifiers[_nullifier] == false,
            "NftMint: nullifier seen"
        );

        uint256[3] memory publicInputs = [
            _nullifier,
            hash,
            uint256(uint160(address(msg.sender)))
        ];

        require(
            verifyProof(a,b,c, publicInputs),
            "NftMint: invalid proof"
        );

        nullifiers[_nullifier] = true;

        _safeMint(msg.sender, nextTokenId);
        nextTokenId ++;
    }
}