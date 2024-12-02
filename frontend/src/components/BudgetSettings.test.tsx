import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import '@testing-library/jest-dom';
import BudgetSetting from './BudgetSetting';


jest.mock('axios');
const mockedAxiosGet = axios.get as jest.Mock; // Type assertion to Jest Mock
const mockedAxiosPost = axios.post as jest.Mock;


describe('BudgetSetting Component', () => {
 test('renders correctly with form inputs and button', () => {
   render(<BudgetSetting />);
  
   expect(screen.getByPlaceholderText(/Category/i)).toBeInTheDocument();
   expect(screen.getByPlaceholderText(/Amount/i)).toBeInTheDocument();
   expect(screen.getByText(/Set Budget/i)).toBeInTheDocument();
 });


 test('displays fetched budgets on load', async () => {
   mockedAxiosGet.mockResolvedValueOnce({ data: { Groceries: 150, Utilities: 100 } });


   render(<BudgetSetting />);
  
   await waitFor(() => {
     expect(screen.getByText(/Groceries: \$150/i)).toBeInTheDocument();
     expect(screen.getByText(/Utilities: \$100/i)).toBeInTheDocument();
   });
 });


 test('sends new budget data on form submit', async () => {
   mockedAxiosPost.mockResolvedValueOnce({});
   mockedAxiosGet.mockResolvedValueOnce({ data: { Groceries: 150 } });


   render(<BudgetSetting />);
  
   fireEvent.change(screen.getByPlaceholderText(/Category/i), { target: { value: 'Entertainment' } });
   fireEvent.change(screen.getByPlaceholderText(/Amount/i), { target: { value: '200' } });
   fireEvent.click(screen.getByText(/Set Budget/i));


   await waitFor(() => {
     expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/set_budget', {
       category: 'Entertainment',
       amount: 200,
     });
   });
 });
});
