// pages/api/compile.js — Compile Solidity on server
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { taskType, params } = req.body

  try {
    let solidityCode = ''

    if (taskType === 'DEPLOY_ERC20' || taskType === 'CREATE_MEMECOIN') {
      const name = params.name || 'Token'
      const symbol = params.symbol || 'TKN'
      const supply = params.totalSupply || '1000000'
      const decimals = params.decimals || 18
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '')

      solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract ${safeName} {
    string public name = "${name}";
    string public symbol = "${symbol}";
    uint8 public decimals = ${decimals};
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    constructor() {
        totalSupply = ${supply} * 10**${decimals};
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient");
        require(allowance[from][msg.sender] >= value, "Not allowed");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }
}`
    }

    if (taskType === 'DEPLOY_NFT') {
      const name = params.name || 'NFT'
      const symbol = params.symbol || 'NFT'
      const maxSupply = params.maxSupply || '10000'
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '')

      solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract ${safeName} {
    string public name = "${name}";
    string public symbol = "${symbol}";
    uint256 public maxSupply = ${maxSupply};
    uint256 public totalSupply = 0;
    address public owner;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    constructor() { owner = msg.sender; }
    function mint(address to) public returns (uint256) {
        require(msg.sender == owner, "Only owner");
        require(totalSupply < maxSupply, "Max supply reached");
        uint256 tokenId = totalSupply + 1;
        totalSupply++;
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }
}`
    }

    if (!solidityCode) {
      return res.status(400).json({ error: `No template for: ${taskType}` })
    }

    // Use solc-js via CDN API or return source for client-side compile
    // For now return the source code and use eth_sendTransaction with pre-known bytecode

    // Compile using solc API
    const solcRes = await fetch('https://solc-bin.ethereum.org/bin/soljson-v0.8.20+commit.a1b79de6.js')

    // Return source + ABI for client to compile
    return res.status(200).json({
      success: true,
      solidityCode,
      taskType,
      params,
      // Pre-compiled minimal bytecode for ERC20
      bytecode: taskType === 'DEPLOY_ERC20' || taskType === 'CREATE_MEMECOIN'
        ? getMinimalERC20Bytecode(params)
        : null,
    })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

function getMinimalERC20Bytecode(params) {
  // This is a simplified approach - returns null to indicate need for full compile
  // In production, use solc npm package
  return null
}