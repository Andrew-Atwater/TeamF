import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  Divider,
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
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [yearOfStudy, setYearOfStudy] = useState<string>('');
  const [residencyStatus, setResidencyStatus] = useState<'in-state' | 'out-of-state' | ''>('');
  const [creditHours, setCreditHours] = useState<string>('');
  const [housingType, setHousingType] = useState<'on-campus' | 'off-campus' | ''>('');
  const [roomType, setRoomType] = useState<string>('');
  const [monthlyRent, setMonthlyRent] = useState<string>('');
  const [wantsMealPlan, setWantsMealPlan] = useState<boolean | null>(null);
  const [selectedMealPlan, setSelectedMealPlan] = useState<string>('');
  const [additionalFoodCost, setAdditionalFoodCost] = useState<string>('');
  const [scholarships, setScholarships] = useState<string>('');
  const [totalCost, setTotalCost] = useState<number>(0);

  const FEES = [
    { name: 'Infrastructure and Tech Fee', amount: 432.00 },
    { name: 'Student Activity Fee', amount: 78.00 },
    { name: 'Academic Materials Program', amount: 239.99 }
  ];

  useEffect(() => {
    calculateTotalCost();
  }, [roomType, monthlyRent, selectedMealPlan, additionalFoodCost, residencyStatus, creditHours, scholarships]);

  const calculateTotalCost = () => {
    let total = 0;

    // Add tuition cost
    if (residencyStatus && creditHours) {
      const creditHourRate = residencyStatus === 'in-state' ? 388 : 1108;
      total += parseFloat(creditHours) * creditHourRate;
    }

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

    // Subtract scholarships
    if (scholarships) {
      total -= parseFloat(scholarships);
    }

    setTotalCost(total);
  };

  const calculateTotalWithFees = () => {
    const feesTotal = FEES.reduce((sum, fee) => sum + fee.amount, 0);
    return totalCost + feesTotal;
  };

  const handleYearChange = (event: SelectChangeEvent) => {
    const year = event.target.value;
    setYearOfStudy(year);
  };

  const handleYearSubmit = () => {
    setStep(2);
  };

  const handleResidencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResidencyStatus(event.target.value as 'in-state' | 'out-of-state');
  };

  const handleResidencySubmit = () => {
    setStep(3);
  };

  const handleCreditHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hours = event.target.value;
    if (!hours || (parseFloat(hours) >= 0 && parseFloat(hours) <= 24)) {
      setCreditHours(hours);
    }
  };

  const handleCreditHoursSubmit = () => {
    if (creditHours && parseFloat(creditHours) >= 0 && parseFloat(creditHours) <= 24) {
      if (yearOfStudy === '1') {
        setHousingType('on-campus');
        setWantsMealPlan(true);
        setStep(5);
      } else {
        setStep(4);
      }
    }
  };

  const handleHousingTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHousingType(event.target.value as 'on-campus' | 'off-campus');
  };

  const handleHousingTypeSubmit = () => {
    setStep(5);
  };

  const handleRoomTypeChange = (event: SelectChangeEvent) => {
    setRoomType(event.target.value);
  };

  const handleRoomTypeSubmit = () => {
    if (yearOfStudy === '1') {
      setStep(7);
    } else {
      setStep(6);
    }
  };

  const handleMonthlyRentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyRent(event.target.value);
  };

  const handleMonthlyRentSubmit = () => {
    setStep(6);
  };

  const handleMealPlanChoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWantsMealPlan(event.target.value === 'yes');
  };

  const handleMealPlanChoiceSubmit = () => {
    setStep(7);
  };

  const handleMealPlanSelection = (event: SelectChangeEvent) => {
    setSelectedMealPlan(event.target.value);
  };

  const handleMealPlanSelectionSubmit = () => {
    setStep(8);
  };

  const handleAdditionalFoodCost = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value || parseFloat(value) >= 0) {
      setAdditionalFoodCost(value);
    }
  };

  const handleAdditionalFoodSubmit = () => {
    if (additionalFoodCost && parseFloat(additionalFoodCost) >= 0) {
      setStep(9);
    }
  };

  const handleScholarshipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value || parseFloat(value) >= 0) {
      setScholarships(value);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      // Special handling for first years going back from room selection
      if (yearOfStudy === '1' && step === 5) {
        setStep(1);
        setHousingType('');
        setWantsMealPlan(null);
      } 
      // Special handling for first years going back from meal plan selection
      else if (yearOfStudy === '1' && step === 7) {
        setStep(5);
      }
      // Default back behavior
      else {
        setStep(step - 1);
      }
    }
  };

  const getSummaryItems = () => {
    const items = [];

    // Year of Study
    items.push({
      label: "Year of Study",
      value: yearOfStudy === '4+' ? 'Fourth Year+' : `${yearOfStudy}${['1', '2', '3'].includes(yearOfStudy) ? 'st' : 'th'} Year`,
      step: 1
    });

    // Residency Status
    items.push({
      label: "Residency Status",
      value: residencyStatus === 'in-state' ? 'In-State Resident' : 'Out-of-State Student',
      step: 2
    });

    // Credit Hours and Tuition
    const creditHourRate = residencyStatus === 'in-state' ? 388 : 1108;
    const tuitionCost = parseFloat(creditHours) * creditHourRate;
    items.push({
      label: "Credit Hours",
      value: `${creditHours} credits ($${creditHourRate}/credit)`,
      cost: tuitionCost,
      step: 3
    });

    // Housing
    if (housingType === 'on-campus') {
      const selectedRoom = roomRates.find(room => room.type === roomType);
      items.push({
        label: "Housing",
        value: `On-Campus: ${roomType}`,
        cost: selectedRoom?.rate || 0,
        step: 5
      });
    } else if (housingType === 'off-campus') {
      const semesterRent = parseFloat(monthlyRent) * 4;
      items.push({
        label: "Housing",
        value: `Off-Campus: $${monthlyRent}/month`,
        cost: semesterRent,
        step: 5
      });
    }

    // Meal Plan
    if (wantsMealPlan || yearOfStudy === '1') {
      const selectedPlan = mealPlans.find(plan => plan.type === selectedMealPlan);
      items.push({
        label: "Meal Plan",
        value: selectedMealPlan,
        cost: selectedPlan?.rate || 0,
        step: 7
      });
    }

    // Additional Food Cost
    const monthlyFood = parseFloat(additionalFoodCost);
    if (!isNaN(monthlyFood)) {
      items.push({
        label: wantsMealPlan ? "Additional Food Cost" : "Grocery Cost",
        value: `$${additionalFoodCost}/month`,
        cost: monthlyFood * 4,
        step: 8
      });
    }

    // Scholarships
    const scholarshipAmount = parseFloat(scholarships);
    if (!isNaN(scholarshipAmount) && scholarshipAmount > 0) {
      items.push({
        label: "Scholarships",
        value: `$${scholarships}`,
        cost: -scholarshipAmount,
        step: 9
      });
    }

    return items;
  };

  const handleCreateDebtAccount = () => {
    // Store the total in localStorage for the account creation page
    localStorage.setItem('pendingDebtAmount', calculateTotalWithFees().toString());
    navigate('/');
  };

  const CreditHours = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center'  // Add vertical centering
    }}>
      <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
        Credit Hours
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',  // Center items vertically
        gap: 2  // Add consistent spacing between amount and button
      }}>
        <Typography variant="h4" component="p" sx={{ color: 'text.primary' }}>
          ${creditHours ? (parseFloat(creditHours) * (residencyStatus === 'in-state' ? 388 : 1108)).toLocaleString() : '0'}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setStep(3)}
          sx={{ 
            minWidth: 'auto',
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          EDIT
        </Button>
      </Box>
    </Box>
  );

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
          {residencyStatus && creditHours && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Tuition ({creditHours} credit hours @ ${residencyStatus === 'in-state' ? '388' : '1,108'}/credit):
              ${(parseFloat(creditHours) * (residencyStatus === 'in-state' ? 388 : 1108)).toLocaleString()}
            </Typography>
          )}
          {scholarships && parseFloat(scholarships) > 0 && (
            <Typography variant="body2" color="success.light">
              Scholarships: -${parseFloat(scholarships).toLocaleString()}
            </Typography>
          )}
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
                sx={{ mb: 2 }}
              >
                <MenuItem value="" disabled>Select your year</MenuItem>
                <MenuItem value="1">First Year</MenuItem>
                <MenuItem value="2">Second Year</MenuItem>
                <MenuItem value="3">Third Year</MenuItem>
                <MenuItem value="4">Fourth Year</MenuItem>
                <MenuItem value="4+">Fourth Year+</MenuItem>
              </Select>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  onClick={handleYearSubmit}
                  disabled={!yearOfStudy}
                >
                  Continue
                </Button>
              </Box>
            </FormControl>
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Are you an in-state or out-of-state student?</FormLabel>
              <RadioGroup
                value={residencyStatus}
                onChange={handleResidencyChange}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="in-state" control={<Radio />} label="In-State Resident" />
                <FormControlLabel value="out-of-state" control={<Radio />} label="Out-of-State Student" />
              </RadioGroup>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleResidencySubmit}
                  disabled={!residencyStatus}
                >
                  Continue
                </Button>
              </Box>
            </FormControl>
          </Box>
        )}

        {step === 3 && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>How many credit hours will you be taking this semester?</FormLabel>
              <TextField
                type="number"
                value={creditHours}
                onChange={handleCreditHoursChange}
                placeholder="Enter credit hours (0-24)"
                inputProps={{
                  min: 0,
                  max: 24,
                  step: 1
                }}
                helperText={`Tuition rate: $${residencyStatus === 'in-state' ? '388' : '1,108'} per credit hour`}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleCreditHoursSubmit}
                  disabled={!creditHours || parseFloat(creditHours) < 0 || parseFloat(creditHours) > 24}
                >
                  Continue
                </Button>
              </Box>
            </FormControl>
          </Box>
        )}

        {step === 4 && yearOfStudy !== '1' && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Will you be living on or off campus?</FormLabel>
              <RadioGroup
                value={housingType}
                onChange={handleHousingTypeChange}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="on-campus" control={<Radio />} label="On Campus" />
                <FormControlLabel value="off-campus" control={<Radio />} label="Off Campus" />
              </RadioGroup>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleHousingTypeSubmit}
                  disabled={!housingType}
                >
                  Continue
                </Button>
              </Box>
            </FormControl>
          </Box>
        )}

        {step === 5 && housingType === 'on-campus' && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Select your room type:</FormLabel>
              <Select
                value={roomType}
                onChange={handleRoomTypeChange}
                displayEmpty
                sx={{ mb: 2 }}
              >
                <MenuItem value="" disabled>Select room type</MenuItem>
                {roomRates.map((room) => (
                  <MenuItem key={room.type} value={room.type}>
                    {room.type} - ${room.rate}/semester
                  </MenuItem>
                ))}
              </Select>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleRoomTypeSubmit}
                  disabled={!roomType}
                >
                  Continue
                </Button>
              </Box>
            </FormControl>
          </Box>
        )}

        {step === 5 && housingType === 'off-campus' && (
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
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleMonthlyRentSubmit}
                  disabled={!monthlyRent || parseFloat(monthlyRent) < 0}
                >
                  Continue
                </Button>
              </Box>
            </FormControl>
          </Box>
        )}

        {step === 6 && yearOfStudy !== '1' && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Will you be purchasing a meal plan?</FormLabel>
              <RadioGroup
                value={wantsMealPlan ? 'yes' : 'no'}
                onChange={handleMealPlanChoice}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleMealPlanChoiceSubmit}
                  disabled={wantsMealPlan === null}
                >
                  Continue
                </Button>
              </Box>
            </FormControl>
          </Box>
        )}

        {step === 7 && (wantsMealPlan || yearOfStudy === '1') && (
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
                sx={{ mb: 2 }}
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
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleMealPlanSelectionSubmit}
                  disabled={!selectedMealPlan}
                >
                  Continue
                </Button>
              </Box>
              {yearOfStudy === '1' && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Note: First-year students are required to purchase an Unlimited meal plan
                </Typography>
              )}
            </FormControl>
          </Box>
        )}

        {step === 8 && (
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
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleAdditionalFoodSubmit}
                  disabled={!additionalFoodCost || parseFloat(additionalFoodCost) < 0}
                >
                  Continue
                </Button>
              </Box>
            </FormControl>
          </Box>
        )}

        {step === 9 && (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Estimated total scholarships for the semester:</FormLabel>
              <TextField
                type="number"
                value={scholarships}
                onChange={handleScholarshipChange}
                placeholder="Enter scholarship amount"
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => setStep(10)}
                  disabled={scholarships !== '' && parseFloat(scholarships) < 0}
                >
                  Finish
                </Button>
              </Box>
            </FormControl>
          </Box>
        )}

        {step === 10 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
              Summary of Selections
            </Typography>
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3, 
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3
              }}
            >
              <List sx={{ width: '100%' }}>
                {getSummaryItems().map((item, index) => (
                  <React.Fragment key={item.label}>
                    <ListItem
                      sx={{
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'  // Center items vertically
                      }}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setStep(item.step)}
                          sx={{
                            color: 'primary.main',
                            borderColor: 'primary.main',
                            '&:hover': {
                              borderColor: 'primary.dark',
                              backgroundColor: 'primary.dark',
                              color: 'white'
                            }
                          }}
                        >
                          Edit
                        </Button>
                      }
                    >
                      <Box sx={{ flex: 1, pr: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 'bold',
                            color: 'text.primary'
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary'
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                      {item.cost !== undefined && (
                        <Typography
                          variant="h6"
                          sx={{
                            ml: 2,
                            color: item.cost < 0 ? 'success.main' : 'text.primary',
                            fontWeight: 'bold',
                            minWidth: '120px',
                            textAlign: 'right',
                            mr: 8,
                            display: 'flex',
                            alignItems: 'center',  // Center text vertically
                            height: '100%'  // Take full height of container
                          }}
                        >
                          {item.cost < 0 ? '-' : ''}${Math.abs(item.cost).toLocaleString()}
                        </Typography>
                      )}
                    </ListItem>
                    {index < getSummaryItems().length - 1 && (
                      <Divider 
                        sx={{ 
                          my: 1,
                          borderColor: 'divider'
                        }} 
                      />
                    )}
                  </React.Fragment>
                ))}
                <Divider sx={{ my: 2, borderColor: 'divider' }} />
                <ListItem
                  sx={{
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary'
                    }}
                  >
                    Estimated Subtotal
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      mr: 8
                    }}
                  >
                    ${totalCost.toLocaleString()}
                  </Typography>
                </ListItem>
              </List>
            </Paper>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setStep(11)}
                size="large"
                sx={{
                  px: 4,
                  py: 1,
                  fontSize: '1.1rem'
                }}
              >
                Continue to Final Total
              </Button>
            </Box>
          </Box>
        )}

        {step === 11 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
              Final Cost Breakdown
            </Typography>
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3, 
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3
              }}
            >
              <List sx={{ width: '100%' }}>
                {/* Subtotal */}
                <ListItem
                  sx={{
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary'
                    }}
                  >
                    Subtotal
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mr: 2
                    }}
                  >
                    ${totalCost.toLocaleString()}
                  </Typography>
                </ListItem>

                <Divider sx={{ my: 2, borderColor: 'divider' }} />

                {/* Fees Section */}
                <ListItem
                  sx={{
                    py: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 1
                    }}
                  >
                    Required Fees
                  </Typography>
                  <Box sx={{ width: '100%' }}>
                    {FEES.map((fee, index) => (
                      <Box
                        key={fee.name}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: 'text.secondary' }}
                        >
                          {fee.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.primary',
                            mr: 2
                          }}
                        >
                          ${fee.amount.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </ListItem>

                <Divider 
                  sx={{ 
                    my: 2, 
                    borderColor: 'divider',
                    borderWidth: 2 
                  }} 
                />

                {/* Grand Total */}
                <ListItem
                  sx={{
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'primary.main',
                    borderRadius: 1,
                    mt: 2
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white'
                    }}
                  >
                    GRAND TOTAL
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    ${calculateTotalWithFees().toLocaleString()}
                  </Typography>
                </ListItem>
              </List>
            </Paper>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => setStep(10)}
                size="large"
                sx={{
                  px: 4,
                  py: 1,
                  fontSize: '1.1rem'
                }}
              >
                Back to Summary
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCreateDebtAccount}
                  size="large"
                  sx={{
                    px: 4,
                    py: 1,
                    fontSize: '1.1rem'
                  }}
                >
                  Create Bill Account
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setStep(1)}
                  size="large"
                  sx={{
                    px: 4,
                    py: 1,
                    fontSize: '1.1rem'
                  }}
                >
                  Start Over
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CostCalculator; 