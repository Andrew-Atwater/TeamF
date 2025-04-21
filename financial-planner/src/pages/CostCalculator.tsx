import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Box,
  SelectChangeEvent,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Paper,
} from '@mui/material';

interface RoomRate {
  type: string;
  rate: number;
}

interface MealPlan {
  type: string;
  description: string;
  rate: number;
  restrictions?: string;
}

const roomRates: RoomRate[] = [
  { type: 'Double', rate: 3477 },
  { type: 'Single', rate: 4428 },
  { type: 'Small Single', rate: 3973 },
  { type: 'Double Single', rate: 4685 },
];

const mealPlans: MealPlan[] = [
  {
    type: 'Unlimited Basic',
    description: 'Unlimited visits to our campus dining halls, $50 Meal Plan Dollars, Unlimited To-Go meals, 6 guest meals, 2 meal exchanges per week, Kiwibot Bottomless Subscription',
    rate: 3430
  },
  {
    type: 'Unlimited Flex',
    description: 'Unlimited visits to our campus dining halls, $200 Meal Plan Dollars, Unlimited To-Go Meals, 6 guest meals, 2 meal exchanges per week, Kiwibot Bottomless Subscription',
    rate: 3580
  },
  {
    type: 'Unlimited Flex Plus',
    description: 'Unlimited visits to our campus dining halls, $400 Meal Plan Dollars, Unlimited To-Go Meals, 6 guest meals, 2 meal exchanges per week, Kiwibot Bottomless Subscription',
    rate: 3780
  },
  {
    type: 'H2O Plan',
    description: '120 meal swipes, $1,500 meal plan dollars, Bottomless Kiwibot subscription, 6 guest meals, Unlimited To-Go meals (1 per dining period) and 1 meal exchange per day (Monday–Friday, 2–6 p.m.)',
    rate: 3050,
    restrictions: 'Hancock-Hart-Oak Residents only'
  },
  {
    type: 'Junior-Senior Flex',
    description: '120 visits, $1,350 Meal Plan Dollars, 16 To-Go Meals, 6 guest meals',
    rate: 2900
  },
  {
    type: 'Senior Flex',
    description: '$2,850 Meal Plan Dollars, 6 guest meals',
    rate: 2850
  },
  {
    type: '85 Flex',
    description: '85 visits, $900 Meal Plan Dollars, 2 guest meals',
    rate: 2000
  },
  {
    type: '50 Plan',
    description: '50 visits, no Meal Plan Dollars, 2 guest meals',
    rate: 650
  },
  {
    type: '25 Plan',
    description: '25 visits, no Meal Plan Dollars, 1 guest meal',
    rate: 325
  },
  {
    type: 'Graduate/DTAV Plan',
    description: '$640 Meal Plan Dollars',
    rate: 640
  }
];

const CostCalculator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [yearOfStudy, setYearOfStudy] = useState<string>('');
  const [housingType, setHousingType] = useState<'on-campus' | 'off-campus' | ''>('');
  const [roomType, setRoomType] = useState<string>('');
  const [monthlyRent, setMonthlyRent] = useState<string>('');
  const [wantsMealPlan, setWantsMealPlan] = useState<boolean | null>(null);
  const [selectedMealPlan, setSelectedMealPlan] = useState<string>('');
  const [additionalFoodCost, setAdditionalFoodCost] = useState<string>('');
  const [totalCost, setTotalCost] = useState<number>(0);

  useEffect(() => {
    calculateTotalCost();
  }, [roomType, monthlyRent, selectedMealPlan, additionalFoodCost]);

  const calculateTotalCost = () => {
    let total = 0;

    // Add housing cost
    if (housingType === 'on-campus' && roomType) {
      const selectedRoom = roomRates.find(room => room.type === roomType);
      if (selectedRoom) {
        total += selectedRoom.rate;
      }
    } else if (housingType === 'off-campus' && monthlyRent) {
      total += parseFloat(monthlyRent) * 4;
    }

    // Add meal plan cost
    if (selectedMealPlan) {
      const selectedPlan = mealPlans.find(plan => plan.type === selectedMealPlan);
      if (selectedPlan) {
        total += selectedPlan.rate;
      }
    }

    // Add additional food cost
    if (additionalFoodCost) {
      total += parseFloat(additionalFoodCost) * 4;
    }

    setTotalCost(total);
  };

  const handleYearChange = (event: SelectChangeEvent) => {
    const year = event.target.value;
    setYearOfStudy(year);
    
    if (year === '1') {
      setHousingType('on-campus');
      setWantsMealPlan(true); // First years must have a meal plan
      setStep(3); // Skip housing type question for first years
    } else {
      setStep(2);
    }
  };

  const handleHousingTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHousingType(event.target.value as 'on-campus' | 'off-campus');
    setStep(3);
  };

  const handleRoomTypeChange = (event: SelectChangeEvent) => {
    setRoomType(event.target.value);
    if (yearOfStudy === '1') {
      setStep(5); // Skip meal plan choice for first years, go straight to plan selection
    } else {
      setStep(4);
    }
  };

  const handleMonthlyRentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyRent(event.target.value);
    setStep(4);
  };

  const handleMealPlanChoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWantsMealPlan(event.target.value === 'yes');
    setStep(5);
  };

  const handleMealPlanSelection = (event: SelectChangeEvent) => {
    setSelectedMealPlan(event.target.value);
    setStep(6);
  };

  const handleAdditionalFoodCost = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdditionalFoodCost(event.target.value);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4, position: 'relative' }}>
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            padding: 2,
            zIndex: 1000,
            backgroundColor: 'primary.main',
            color: 'white'
          }}
        >
          <Typography variant="h6">
            Estimated Semester Cost:
          </Typography>
          <Typography variant="h4">
            ${totalCost.toLocaleString()}
          </Typography>
        </Paper>

        <Typography variant="h4" component="h1" gutterBottom>
          Cost Calculator
        </Typography>

        {step === 1 && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>What year of school will you be entering?</FormLabel>
              <Select
                value={yearOfStudy}
                onChange={handleYearChange}
                displayEmpty
              >
                <MenuItem value="" disabled>Select your year</MenuItem>
                <MenuItem value="1">First Year</MenuItem>
                <MenuItem value="2">Second Year</MenuItem>
                <MenuItem value="3">Third Year</MenuItem>
                <MenuItem value="4">Fourth Year</MenuItem>
                <MenuItem value="4+">Fourth Year+</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ mt: 3 }}>
            <FormControl>
              <FormLabel>Will you be living on or off campus?</FormLabel>
              <RadioGroup
                value={housingType}
                onChange={handleHousingTypeChange}
              >
                <FormControlLabel value="on-campus" control={<Radio />} label="On Campus" />
                <FormControlLabel value="off-campus" control={<Radio />} label="Off Campus" />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {step === 3 && housingType === 'on-campus' && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Select your room type:</FormLabel>
              <Select
                value={roomType}
                onChange={handleRoomTypeChange}
                displayEmpty
              >
                <MenuItem value="" disabled>Select room type</MenuItem>
                {roomRates.map((room) => (
                  <MenuItem key={room.type} value={room.type}>
                    {room.type} - ${room.rate}/semester
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {step === 3 && housingType === 'off-campus' && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Estimated monthly rent:</FormLabel>
              <TextField
                type="number"
                value={monthlyRent}
                onChange={handleMonthlyRentChange}
                placeholder="Enter monthly rent"
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </FormControl>
          </Box>
        )}

        {step === 4 && yearOfStudy !== '1' && (
          <Box sx={{ mt: 3 }}>
            <FormControl>
              <FormLabel>Will you be purchasing a meal plan?</FormLabel>
              <RadioGroup
                value={wantsMealPlan ? 'yes' : 'no'}
                onChange={handleMealPlanChoice}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {step === 5 && (wantsMealPlan || yearOfStudy === '1') && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>
                {yearOfStudy === '1' 
                  ? "Select your meal plan (First-year students must choose an Unlimited plan):"
                  : "Select your meal plan:"}
              </FormLabel>
              <Select
                value={selectedMealPlan}
                onChange={handleMealPlanSelection}
                displayEmpty
              >
                <MenuItem value="" disabled>Select meal plan</MenuItem>
                {mealPlans
                  .filter(plan => yearOfStudy === '1' 
                    ? plan.type.startsWith('Unlimited') 
                    : true)
                  .map((plan) => (
                    <MenuItem 
                      key={plan.type} 
                      value={plan.type}
                      disabled={plan.restrictions ? yearOfStudy !== '1' : false}
                    >
                      <Box>
                        <Typography variant="subtitle1">
                          {plan.type} - ${plan.rate}/semester
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan.description}
                        </Typography>
                        {plan.restrictions && (
                          <Typography variant="body2" color="error">
                            {plan.restrictions}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
              {yearOfStudy === '1' && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Note: First-year students are required to purchase an Unlimited meal plan
                </Typography>
              )}
            </FormControl>
          </Box>
        )}

        {step === 6 && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>
                {wantsMealPlan 
                  ? "Estimated monthly spending on food outside of meal plan:"
                  : "Estimated monthly spending on groceries:"}
              </FormLabel>
              <TextField
                type="number"
                value={additionalFoodCost}
                onChange={handleAdditionalFoodCost}
                placeholder="Enter monthly food cost"
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </FormControl>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CostCalculator; 