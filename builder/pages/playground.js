import React, { useRef, Suspense } from 'react';

import { watchAccount, getAccount, fetchToken, fetchBalance } from '@wagmi/core'

import Editor from '@monaco-editor/react';

import Render from 'components/render';


let editorRef;



export default function TestPage({ source }) {

    editorRef = useRef(null);
    const [content, setContent] = React.useState(`


# Hello, world!

# Variables


# Basic components

<div>{tokenAddress = "0xb6ca7399b4f9ca56fc27cbff44f4d2e4eef1fc81"}</div>
<script>{
    (() => {
        ERC20ABI = [
            {
              "constant": true,
              "inputs": [
                
              ],
              "name": "name",
              "outputs": [
                {
                  "name": "",
                  "type": "string"
                }
              ],
              "payable": false,
              "stateMutability": "view",
              "type": "function"
            },
            {
              "constant": false,
              "inputs": [
                {
                  "name": "_spender",
                  "type": "address"
                },
                {
                  "name": "_value",
                  "type": "uint256"
                }
              ],
              "name": "approve",
              "outputs": [
                {
                  "name": "",
                  "type": "bool"
                }
              ],
              "payable": false,
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "constant": true,
              "inputs": [
                
              ],
              "name": "totalSupply",
              "outputs": [
                {
                  "name": "",
                  "type": "uint256"
                }
              ],
              "payable": false,
              "stateMutability": "view",
              "type": "function"
            },
            {
              "constant": false,
              "inputs": [
                {
                  "name": "_from",
                  "type": "address"
                },
                {
                  "name": "_to",
                  "type": "address"
                },
                {
                  "name": "_value",
                  "type": "uint256"
                }
              ],
              "name": "transferFrom",
              "outputs": [
                {
                  "name": "",
                  "type": "bool"
                }
              ],
              "payable": false,
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "constant": true,
              "inputs": [
                
              ],
              "name": "decimals",
              "outputs": [
                {
                  "name": "",
                  "type": "uint8"
                }
              ],
              "payable": false,
              "stateMutability": "view",
              "type": "function"
            },
            {
              "constant": true,
              "inputs": [
                {
                  "name": "_owner",
                  "type": "address"
                }
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "name": "balance",
                  "type": "uint256"
                }
              ],
              "payable": false,
              "stateMutability": "view",
              "type": "function"
            },
            {
              "constant": true,
              "inputs": [
                
              ],
              "name": "symbol",
              "outputs": [
                {
                  "name": "",
                  "type": "string"
                }
              ],
              "payable": false,
              "stateMutability": "view",
              "type": "function"
            },
            {
              "constant": false,
              "inputs": [
                {
                  "name": "_to",
                  "type": "address"
                },
                {
                  "name": "_value",
                  "type": "uint256"
                }
              ],
              "name": "transfer",
              "outputs": [
                {
                  "name": "",
                  "type": "bool"
                }
              ],
              "payable": false,
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "constant": true,
              "inputs": [
                {
                  "name": "_owner",
                  "type": "address"
                },
                {
                  "name": "_spender",
                  "type": "address"
                }
              ],
              "name": "allowance",
              "outputs": [
                {
                  "name": "",
                  "type": "uint256"
                }
              ],
              "payable": false,
              "stateMutability": "view",
              "type": "function"
            },
            {
              "payable": true,
              "stateMutability": "payable",
              "type": "fallback"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "name": "spender",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "Approval",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "Transfer",
              "type": "event"
            }
        ]
    })()
}</script>

Here is the current block number: <BlockNumber />

Token address = <DisplayVariable variable={tokenAddress} />

<div>{userAddress}</div>


Here is your balance of token: <TokenBalance address="0x4B5922ABf25858d012d12bb1184e5d3d0B6D6BE4" token={tokenAddress} />

Here is your balance of Ether: <Balance address="0x4B5922ABf25858d012d12bb1184e5d3d0B6D6BE4" />
# Here you can send some eth to me:
# Connected acount

# Here is a contract read
<ContractRead address={tokenAddress} abi={ERC20ABI} functionName="symbol" />
    `);
    const [rendered, setRendered] = React.useState(content);

    let account = getAccount();

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    async function handleEditorChange(value, event) {
        console.log('here is the current model value:', value);
        setContent(value)
    }

    function handleRender() {
        console.log('rendering');
        setRendered(content)
    }


    <Editor height="90vh" defaultLanguage="javascript" onChange={handleEditorChange}
        onMount={handleEditorDidMount} defaultValue="// some comment" />;


    return (
        <div>
            <div className="bg-slate-500 p-2	md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Playground
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <button
                        onClick={handleRender}
                        type="button"
                        className="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                    >
                        Render
                    </button>
                    <button
                        type="button"
                        className="ml-3 inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                        Publish
                    </button>
                </div>
            </div>
            <div className=" flex">
                <div className="flex-1">
                    <Render content={rendered} />

                </div>
                <div className="flex-1">
                    <Editor height="90vh" defaultLanguage="javascript" onChange={handleEditorChange}
                        onMount={handleEditorDidMount} defaultValue={content} />;
                </div>

            </div>
        </div>
    )
}
