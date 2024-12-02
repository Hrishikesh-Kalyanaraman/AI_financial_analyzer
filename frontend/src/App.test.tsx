import axios from 'axios';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';


jest.mock('axios');
const mockedAxiosGet = axios.get as jest.Mock; // Type assertion to Jest Mock
const mockedAxiosPost = axios.post as jest.Mock;


describe('App Component', () => {
 test('renders budget and spending information correctly', async () => {
   mockedAxiosGet.mockResolvedValueOnce({
     data: { Groceries: 150, Utilities: 100 },
   });


   mockedAxiosGet.mockResolvedValueOnce({
     data: { expenses: [{ Category: 'Groceries', Amount: 120 }], alerts: [] },
   });


   render(<App />);


   await waitFor(() => {
     expect(screen.getByText(/Total Budget/i)).toBeInTheDocument();
     expect(screen.getByText(/\$250/i)).toBeInTheDocument();
     expect(screen.getByText(/Total Spending/i)).toBeInTheDocument();
     expect(screen.getByText(/\$120/i)).toBeInTheDocument();
   });
 });
});
