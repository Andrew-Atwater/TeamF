import React, { useState } from 'react';
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
} from '@mui/material';

interface RoomRate {
  type: string;
  rate: number;
}

const roomRates: RoomRate[] = [
  { type: 'Double', rate: 3477 },
  { type: 'Single', rate: 4428 },
  { type: 'Small Single', rate: 3973 },
  { type: 'Double Single', rate: 4685 },
];

const CostCalculator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [yearOfStudy, setYearOfStudy] = useState<string>('');
  const [housingType, setHousingType] = useState<'on-campus' | 'off-campus' | ''>('');
  const [roomType, setRoomType] = useState<string>('');
  const [monthlyRent, setMonthlyRent] = useState<string>('');

  const handleYearChange = (event: SelectChangeEvent) => {
    const year = event.target.value;
    setYearOfStudy(year);
    
    if (year === '1') {
      setHousingType('on-campus');
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
  };

  const handleMonthlyRentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyRent(event.target.value);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
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
      </Box>
    </Container>
  );
};

export default CostCalculator; 