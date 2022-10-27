import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { Stack } from '@mui/system';

let costInitialized = false;
let addOnsInitialized = false;

export default function DrinkDialog({ drink, addDrinkOrder, open, setOpen }) {
  const [amount, setAmount] = useState(1);
  const [addOns, setAddOns] = useState([]);
  const [cost, setCost] = useState();

  useEffect(() => {
    fetch('api/getingredients/')
      .then(response => response.json())
      .then(ingredients => {
        ingredients.forEach(element => {
          element.number = 0;
        });

        setAddOns(ingredients)
      })
  }, []);

  useEffect(() => {
    if (!addOnsInitialized && addOns.length > 0) {
      addOnsInitialized = true;
      let addOnsCopy = structuredClone(addOns);
      addOnsCopy.forEach(element => {
        element.number = 0;
      });

      setAddOns(addOnsCopy);
    }
  }, [open, addOns])

  useEffect(() => {
    if (!costInitialized && drink) {
      costInitialized = true;
      setCost(drink.cost);
    }
  }, [drink]);

  useEffect(() => {
    if (drink && amount) {
      let addedCost = 0;
      addOns.forEach(element => {
        if (element.number > 0) {
          addedCost += parseFloat(element.number) * parseFloat(element.cost);
        }
      });

      setCost((parseFloat(drink.cost) + addedCost) * amount);
    }
  }, [addOns, drink, amount])

  function save() {
    let filteredAddOns = [];
    addOns.forEach(element => {
      if (element.number > 0) {
        filteredAddOns.push(element);
      }
    })

    addDrinkOrder({
      drink: drink,
      addOns: filteredAddOns,
      amount: amount,
      cost: cost,
    })

    handleClose();
  }

  function handleClose() {
    setOpen(false);
    setAmount(1);
    costInitialized = false;
    addOnsInitialized = false;
  }

  function setAddOnsNumber(index, newNumber) {
    let newAddOns = [...addOns];
    let addOn = {...addOns[index]};
    addOn.number = newNumber;
    newAddOns[index] = addOn
    setAddOns(newAddOns);
  }

  function handleAmountInput(event) {
    let value = event.target.value
		if (isPositiveInteger(value) && parseInt(value) > 0) {
		  setAmount(parseFloat(value))
		}
  }

  function handleAddOnInput(event, index) {
    let value = event.target.value
    if (isPositiveInteger(value) && parseInt(value) >= 0) {
      setAddOnsNumber(index, value);
    }
  }

  const addOnItem = addOns.map((addOn, index) => 
    <Grid item xs={6} key={index}>
      <TextField
        label={addOn.name}
        type="number"
        value={addOn.number}
        onChange={event => handleAddOnInput(event, index)}
        sx={{ marginTop: "10px" }}
      />
    </Grid> 
  )

  return (
    <>
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{drink ? drink.name : ""}</DialogTitle>
      <DialogContent>
        <Stack 
          spacing={2}
          component="form" 
          noValidate 
          autoComplete="false" 
          sx={{ width: '100%' }}
        >
          <Typography>${ Number(cost).toFixed(2) }</Typography>
          <Grid container spacing={2}>
            {addOnItem}
          </Grid>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={handleAmountInput}
            sx={{ marginTop: "10px" }}
          />
          <Button
            onClick={save}
            variant="contained"
          >
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
    </>
  );
}

function isPositiveInteger(value) {
  return /^\d*$/.test(value);
}