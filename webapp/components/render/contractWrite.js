import { default as React, Fragment, useState, useRef, useEffect } from 'react';
import { usePrepareContractWrite, useAccount } from 'wagmi'
import { fetchToken, getContract } from '@wagmi/core'
import { useToken } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import DateTimePicker from 'react-datetime-picker';
import 'react-calendar/dist/Calendar.css';
import TokenBalance from 'components/render/tokenBalance';
import ERC20ABI from 'ABIS/ERC20.json';

import SendTransactionButton from 'components/internals/sendTransactionButton';
import ERC20ApprovalModal from 'components/internals/ERC20ApprovalModal';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const WriteContract = (props) => {
    const [balance, setBalance] = React.useState(0);
    const [value, setValue] = React.useState(props.valueAmount != null ? props.valueAmount : "0");

    const [formatted, setFormatted] = React.useState("");
    const [symbol, setSymbol] = React.useState("");
    const [isWantingApproval, setIsWantingApproval] = React.useState(null);
    let rawTransaction;

    const { address, isConnecting, isDisconnected } = useAccount()

    const args = props.args || [];
    const argsStateValues = [];
    const argsStateSetters = [];
    const argsStateTokens = [];
    const argsStateApprovals = [];

    const [approvalId, setApprovalId] = useState(0);

    function getFunction() {
        if (props.functionName == null) {
            return props.abi[0];
        }
        return props.abi.find((element) => element.name === props.functionName && element.type === "function");
    }

    // check if the ERC20 token is approved to be spent
    function checkApproval(token, spender, amount) {
        return new Promise((resolve, reject) => {
            const contract = getContract({
                address: token,
                abi: ERC20ABI
            })
            contract.read.allowance([address, spender]).then((allowance) => {
                console.log("allowance", allowance, amount)
                resolve(allowance >= amount);
            });
        });
    }

    async function onBeforeSendTransaction() {
        //   console.log("beforeClick", argsStateApprovals);
        if (props.onBeforeSendTransaction != null) {
            try {
                await props.onBeforeSendTransaction()
            } catch (error) {
                console.error("Error in onBeforeSendTransaction", error)
            }
        }
        for (const [index, arg] of argsStateApprovals.entries()) {
            if (arg != null) {
                console.log("Checking approval", arg, argsStateValues[index])
                const approved = await checkApproval(argsStateTokens[index].address,  argsStateApprovals[index], parseUnits(argsStateValues[index] + "", argsStateTokens[index].decimals));
                if (!approved) {
                    setIsWantingApproval({
                        token: argsStateTokens[index],
                        amount: argsStateValues[index],
                        spender: argsStateApprovals[index],
                    })
                    setApprovalId(approvalId + 1);
                    return false;
                }
            }
        }
        return true
    }

    async function onTransactionMined(minedTx) {
        //   console.log("beforeClick", argsStateApprovals);
        if (props.onTransactionMined != null) {
            try {
                await props.onTransactionMined(minedTx,rawTransaction)
            } catch (error) {
                console.error("Error in onTransactionMined", error)
            }
        }
    }



    function getPreparedTransaction() {
        let tx = null;
        try {
            let args = [];
            for (const [index, arg] of argsStateValues.entries()) {
                if (argsStateTokens[index] != null) {
                    let nb = parseFloat(arg);
                    if (isNaN(nb)) {
                        nb = 0;
                    }
                    // this is a token so we need the decimals
                    args.push(parseUnits(nb + "", argsStateTokens[index].decimals) );
                } else {
                    args.push(arg);
                }
            }
            rawTransaction = ({ address: props.address, abi: props.abi, functionName: getFunction().name, args: args, value: parseEther(value + "") })
            tx = usePrepareContractWrite(rawTransaction);
            if (tx.error) {
                console.error("There is an error", tx)
            }
        } catch (e) {
            console.error("Error")
            console.error(e)
        }
        return tx;
    }

    for (const [index, input] of getFunction().inputs.entries()) {
        const [value, setter] = React.useState(args[index]);
        argsStateValues.push(value);
        argsStateSetters.push(setter);
        if (input.type === "uint256" && input.token != null) {
            const { data, isError, isLoading } = useToken({
                address: input.token,
            })
            argsStateTokens.push(data);
        } else {
            argsStateTokens.push(null);
        }
        if (input.type === "uint256" && input.ERC20Allow != null) {
            argsStateApprovals.push(input.ERC20Allow);
        } else {
            argsStateApprovals.push(null);
        }

    }

    // This will run only once
    useEffect(() => {

    }, []);


    function makeApprovals() {
        if (isWantingApproval != null) {
            return (<ERC20ApprovalModal approvalId={approvalId} approval={isWantingApproval} token={isWantingApproval.token} spender={isWantingApproval.spender} amount={isWantingApproval.amount} />);
        }
    }

    function makePayable() {
        if ((getFunction().payable || getFunction().stateMutability == "payable") && !getFunction().hideValue) {
            return (
                <div>
                    <div className="form-control w-full ">
                        <label className="label">
                            <span className="label-text">{props.valueFieldName != null ? props.valueFieldName : "Value"}</span>
                        </label>
                        <input type="number" className="input input-bordered w-full " value={value}
                            onChange={e => setValue(e.target.value)} />
                    </div>
                </div>
            )
        }
    }

    function makeForm() {
        return (
            <div>
                {getFunction().inputs.map((input, index) => {
                    if (input.hidden == null || !input.hidden) {
                        if (input.selectChoices != null && typeof input.selectChoices == "object") {
                            // deal with selectChoices and render an HTML select
                            return (
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text"> {input.name}</span>
                                    </label>
                                    <select
                                        id="select"
                                        name="select"
                                        className="select select-bordered"
                                        value={argsStateValues[index]}
                                        onChange={e => argsStateSetters[index](e.target.value)}
                                    >
                                        {Object.entries(input.selectChoices).map(([name, value]) => {
                                            return (
                                                <option value={value}>{name}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                            )
                        }
                        else if (input.type === "bool") {
                            return (
                                <div className="form-control">
                                    <label className="label cursor-pointer">
                                        <span className="label-text">{input.name}</span>
                                        <input type="checkbox" className="checkbox" checked={argsStateValues[index] ? "checked" : ""}
                                            onChange={e => argsStateSetters[index](e.target.checked)} />
                                    </label>
                                </div>
                            )
                        } else if (input.date === true) {
                            return (
                                <div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">{input.name}</span>
                                        </label>
                                        <DateTimePicker className="input input-bordered" onChange={function (d) {
                                            argsStateSetters[index](d.getTime() / 1000)
                                        }} value={new Date(parseInt(argsStateValues[index]) * 1000)} disableClock={true} />
                                    </div>
                                </div>
                            )
                        } else if (input.type === "uint256" && input.token != null) {
                            return (
                                <div className="form-control w-full ">
                                    <label className="label">
                                        <span className="label-text">{input.name}</span>
                                        {(typeof address !== 'undefined' && argsStateTokens[index] != null) && <span className="label-text-alt ">your balance: <span className='underline cursor-pointer'><TokenBalance componentClicked={balance => console.log("CLICKKKED") || argsStateSetters[index](balance.formatted)} address={address} token={argsStateTokens[index].address} /></span>  </span>}
                                    </label>
                                    <div className='join'>
                                        <input type="text"
                                            value={argsStateValues[index]}
                                            onChange={e => argsStateSetters[index](e.target.value)}
                                            name="token_amount"
                                            id="token_amount"
                                            className="input input-bordered w-full join-item" placeholder="0.00"></input>
                                        <button className="btn btn-disabled join-item rounded-r-full">{(argsStateTokens[index] != null ? argsStateTokens[index].symbol : '')}</button>
                                    </div>
                                </div>
                            )
                        } else if (input.longText == true) {
                            return (
                                <div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">{input.name}</span>
                                        </label>
                                        <textarea className="textarea textarea-bordered h-24 w-full" value={argsStateValues[index]}
                                            onChange={e => argsStateSetters[index](e.target.value)}></textarea>
                                    </div>
                                </div>
                            )
                        } else {
                            return (
                                <div>
                                    <div className="form-control w-full ">
                                        <label className="label">
                                            <span className="label-text">{input.name}</span>
                                        </label>
                                        <input type="text" placeholder="Type here" className="input input-bordered w-full " value={argsStateValues[index]}
                                            onChange={e => argsStateSetters[index](e.target.value)} />
                                    </div>
                                </div>
                            )
                        }
                    }
                })}
            </div>
        )
    }

    return (
        <span>
            {makeForm()}
            {makePayable()}
            {makeApprovals()}
            <div className="mt-2">
                <SendTransactionButton onTransactionMined={onTransactionMined} onBeforeSendTransaction={onBeforeSendTransaction} text={props.buttonText != null ? props.buttonText : getFunction().name} transactionDescription={getFunction().name} preparedTransaction={getPreparedTransaction()} />
            </div>
        </span >
    );
}

export default WriteContract;