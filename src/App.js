import { Alchemy, Network } from 'alchemy-sdk';
import React,{ useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';


import { DataGrid  } from '@mui/x-data-grid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Button from '@mui/material/Button';
import './App.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.



const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

//const sdk = require('api')('@alchemy-docs/v1.0#afx1411lbdva7ao');



// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);


function App() {

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const [blockNumber, setBlockNumber] = useState(); 
  const [blocks, setBlocks] = useState([]); 
  const [transactions, setTransactions]= useState([]);
  const [currentTransaction, setCurentTransaction]= useState([]);

  const transactionColumns= [
    { field: 'hash', headerName: 'hash', width: 400 },
    { field: 'from', headerName: 'from', width: 400 },
    { field: 'to', headerName: 'to', width: 400 },
   ];

   const [open, setOpen] = useState(false);
   const handleClose = () => setOpen(false);
   const handleOpen = () => setOpen(true);
  
  
   const myhandleEvent = async (
      params, // GridRowParams
      event, // MuiEvent<React.MouseEvent<HTMLElement>>
      details, // GridCallbackDetails
    ) => {
        try {
          let _currentTransaction= await  transactionReceipt(params.row.hash);
          if(_currentTransaction){
            setCurentTransaction(_currentTransaction);
            handleOpen();
          }
        } catch (error) {
          console.log("error while getting ", );
        }
    };
  async function formattransactions(){
    let formatedTransations=[]
    transactions.slice(0,100).forEach((element, index)=>{
      let currentTransaction=element;
      currentTransaction.unshift({id:index});
      formatedTransations.push(currentTransaction);
    })
    return formatedTransations
  }


  async function transactionReceipt(hash){
    try {
      let response = await alchemy.core.getTransactionReceipt(hash)
      console.log("=== transactionReceipt response === ", response )
      return response
    } catch (error) {
      console.log("=== error in funtion transactionReceipt ===", error)
      return null
    }
   
  }
  async function fetchBlocks() {
    let latestBlocks=[]
    if(blockNumber){
      for(let $i=blockNumber-10;$i<blockNumber+1;$i++){
        latestBlocks.push($i)
      }
      setBlocks(latestBlocks)
    }
    
  }

  async function getBlockNumber() {
    setBlockNumber(await alchemy.core.getBlockNumber());
  }

 
  async function getTransactions() {
    try {
      const currentBlock= await alchemy.core.getBlockWithTransactions(blockNumber);
      setTransactions(currentBlock.transactions);
    } catch (error) {
      console.log("==== error while getting the transactions ==== ")
    }
    
  }

 

  useEffect(() => {
    getBlockNumber()
  },[]);

  useEffect(() => {
    getTransactions()
  },[]);

  useEffect(() => {
    fetchBlocks()
  },[]);

  return <>

        {currentTransaction && open && (
        <Modal
        open={true}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
        <Paper sx={{ flex: 1, mx: 'auto', width: '90%', p: 1 }}>
          <Stack direction="column" spacing={1} sx={{ height: 1 }}>
            <Grid container>
              <Grid item md={12} sm={12}>
                <Typography variant="body2">{`Transaction  ${(currentTransaction.transactionHash)} `}</Typography>
                <Typography variant="body2" >
                  Contract address:  {currentTransaction.contractAddress}
                </Typography>
                <Typography variant="body2" >
                  from:  {currentTransaction.from}
                </Typography>
                
                <Typography variant="body2" >
                  to:  {currentTransaction.to}
                </Typography>
                <Typography variant="body2" >
                  status:  {currentTransaction.status}
                </Typography>
                <Typography variant="body2" >
                  Transaction Index:  {currentTransaction.transactionIndex}
                </Typography>
                <Typography variant="body2" >
                    Block Number: {currentTransaction.blockNumber}
                </Typography>
                <Typography variant="body2" >
                    Gas used:  {parseInt(currentTransaction.gasUsed)}
                </Typography>
                <Typography variant="body2" >
                    Type:  {parseInt(currentTransaction.type)}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Paper>
        </Box>
      </Modal>
        
      )}
    
    <Box sx={{ flexGrow: 1 }}>
    {transactions && transactions.length>1 &&(
      <>
      <h1>Ethereum Mainnet Block explorer</h1>
      <Grid container spacing={2}>
        <Grid item md={2} sm={2}>
        <h3>Latest 10 block list</h3>
        <span>Select (click arrow) a Block to view transactions</span>
        {blocks && blocks.length>1 &&(
          <table>
            <thead>
              <tr>
                <th>Block number</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block,index)=>(
                <tr key={index}>
                  <td>{block}</td>
                  <td><Button variant="text" onClick={() => {setBlockNumber(block); getTransactions()}}><ArrowForwardIcon/></Button></td>
                </tr>
              ))}
            </tbody>
          </table>  
        )}
        </Grid>
        <Grid item md={10} sm={10}>
          <h3>Block {blockNumber} Transactions </h3><span>select transaction to view details</span>
          
          <DataGrid

            rows={transactions.slice(0,100)}
            columns={transactionColumns}
            getRowId={(row) => row.hash}
            onRowClick={myhandleEvent}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 20 },
              },
            }}
            pageSizeOptions={[20, 100]}
            checkboxSelection
          />
      </Grid>
      </Grid>
      </>
    )}

    </Box>
  </>
}

export default App;
