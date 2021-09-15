import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import logoImg from '../assets/vote_logo.png';
import metamaskicon from '../assets/metamask.png';
import Abi from '../abis/contract.json';
import Web3  from 'web3';
import React, { useEffect, useState } from 'react';
import { AbiItem } from 'web3-utils';

interface ResultType {
	votting_result:boolean
	support_num:number
	against_num:number
}

const Home: NextPage = () => {

    const contractAddress = '0x3D6B449bB3a52bA4466DCF1B3f1473E323C50FF0';	
	const [address, setAddress] = useState('');
	const [vote_id, setVoteID] = useState('');
	const [result, setResult] = useState<ResultType>();
	const [agreeloading, setAgreeloading] = useState(false);
	const [txid, setTxid] = useState(null);
	const [respond, setRespond] = useState('');	
	useEffect(()=>{ 
		const ethereum = window;
		if(ethereum && window.sessionStorage.getItem("connect")){
			handleConnect();
		}
	}, []);
	useEffect(()=> {
		timer();
	}, []);

	useEffect(()=>{		
		_init();				
	},[txid]);

	const timer = async() => {
		const {ethereum} =  window;
		const web3 = new Web3(ethereum);		
		const Raffle = new web3.eth.Contract( Abi as AbiItem[], contractAddress);
		const response =  await Raffle.methods.proposal().call();
		setRespond(response);		
	};

	const handleConnect = ()=> {
		const ethereum = window;
		if(ethereum){
			window.ethereum.request({ method: 'eth_requestAccounts' }).then((accs:any)=>{
				if (accs.length) {
					setAddress(accs[0])
					window.sessionStorage.setItem("connect", "1")
				}
			});
		}
	}

	const _init = async()=> {
		const {ethereum} =  window;
		const web3 = new Web3(ethereum);
		if(txid) {				
			const timer = setTimeout(async() => {
				const receipt = await web3.eth.getTransactionReceipt(txid);
				if(receipt !== null && receipt.status === true) {
					setAgreeloading(false);
					onResult();
				}
				else {
					console.log("no any transaction!");				
				}
			}, 5000);
			if(timer)
				return () => clearTimeout(timer);	
		}	
	}

	const  _callBySign = async (method:string, ...args:any)=>{		
		const {ethereum} =  window;
		const web3 = new Web3(ethereum);
		const Raffle = new web3.eth.Contract(Abi as AbiItem[], contractAddress);
		const data = Raffle.methods[method](...args).encodeABI();
		const transaction = ({
			from: address,
			to: contractAddress,
			value: 0,
			data
		});
		return await ethereum.request({ method: 'eth_sendTransaction', params: [transaction]});
	}

	const _call = async (method:string) =>{
		const {ethereum} =  window;
		const web3 = new Web3(ethereum);		
		const Raffle = new web3.eth.Contract( Abi as AbiItem[], contractAddress);
		return await Raffle.methods.getVoteResult().call();
	}

	const _Emit = async (method:string, proposal:string) =>{
		const {ethereum} =  window;
		const web3 = new Web3(ethereum);		
		const Raffle = new web3.eth.Contract( Abi as AbiItem[], contractAddress);
		const data = Raffle.methods[method](proposal).encodeABI();
		const transaction = ({
			from: address,
			to: contractAddress,
			value: 0,
			data
		});
		return await ethereum.request({ method: 'eth_sendTransaction', params: [transaction]});
	}

	const Agree = async()=> {
		setAgreeloading(true);
		const tx_id = await _callBySign("vote",  true);
		if(tx_id)
			setTxid(tx_id);
	}
	const Disagree = async()=> {		
		const tx_id = await _callBySign("vote", false);
		if(tx_id)
			setTxid(tx_id);	
	}
	const onResult =  async()=> {
		const res = await _call("getVoteResult");	
		setResult(res);	
	}

	const onEmit =  async()=> {
		const res = await _Emit("setProposal", respond);
	}

  return (
    <div className={styles.Mainbody}>
        <div style={{display:'flex', justifyContent: 'space-between'}}>
		<div style={{margin:20}}>
          <Image className = {styles.Top_part} width = {100}  height = {100}  src = {logoImg} alt = "logo" />
		  </div>
          <div style={{margin:20}}>
            <button className = {styles.Metamask_connect}   onClick = {handleConnect} style={{display:'flex', alignItems:'center', padding:'10px 30px'}}>
              <Image src = {metamaskicon}  width={30} height={30}   />
              {address ? 
                <span>{address.slice(0,5)+'...'+address.slice(-2)}</span> : 
                <span>CONNECT</span>
              }
            </button>
          </div>
        </div>
        <div className = {styles.title}>
          Votting
        </div>
        <div className={styles.section}>
          <div className={styles.panel}>
			<div className={styles.proposal} style={{display:'flex',alignItems:'center' ,justifyContent: 'center', paddingBottom:20, paddingTop:50}}>
			 Set Proposal
			</div>
		    
            <div className= {styles.ID_input} style={{display:'flex',alignItems:'center' ,justifyContent: 'space-between', paddingBottom:50, paddingTop:50}}>              
              <input type='text' onChange={(e) => setRespond((e.target as any).value)} value = {respond} className = {styles.Input} style={{marginLeft:30, width:"50%"}} />
			  <button className = {styles.Medium_button} onClick={onEmit} style={{padding:'10px 60px', width:'30%'}}>
				Emit
              </button>
            </div>

            <div style={{display:'flex', justifyContent: 'space-between', paddingBottom:50}}>
              <button className = {styles.Medium_button} onClick={Agree} style={{padding:'10px 60px', width:'40%'}}>
				Agree
              </button>
              
              <button className = {styles.Medium_button} onClick={Disagree} style={{padding:'10px 60px', width:'40%'}}>                
                Disagree               
              </button>
            </div>

            <div>
              <button className = {styles.Medium_button} onClick={onResult} style={{padding:'10px 200px', width:'100%'}}>
                Votting Result  
              </button>
            </div>	
            { result ? (
              <div style = {{color:'white', fontSize:'20px', justifyContent:'center', display:'flex'}}>
                <span style = {{padding:10}}>result: {result.votting_result?"yes":"No"}</span>
                <span style = {{padding:10}}>agree: {result.support_num}</span>
                <span style = {{padding:10}}>Disagree: {result.against_num}</span>
              </div>
            ) : null}            
            
          </div>
          
        </div>
    </div>
  )
}

export default Home
